package com.requesttheai.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.responses.ResponseCreateParams;
import com.requesttheai.backend.dto.ConversationSummaryResponse;
import com.requesttheai.backend.dto.CreateConversationRequest;
import com.requesttheai.backend.dto.SendMessageRequest;
import com.requesttheai.backend.dto.SendMessageResponse;
import com.requesttheai.backend.exception.InsufficientCreditsException;
import com.requesttheai.backend.model.Account;
import com.requesttheai.backend.model.Conversation;
import com.requesttheai.backend.model.Message;
import com.requesttheai.backend.model.Model;
import com.requesttheai.backend.model.Usage;
import com.requesttheai.backend.model.User;
import com.requesttheai.backend.model.enums.MessageType;
import com.requesttheai.backend.model.enums.TransactionStatus;
import com.requesttheai.backend.model.enums.UserRole;
import com.requesttheai.backend.repository.AccountRepository;
import com.requesttheai.backend.repository.ConversationRepository;
import com.requesttheai.backend.repository.MessageRepository;
import com.requesttheai.backend.repository.ModelRepository;
import com.requesttheai.backend.repository.UsageRepository;
import com.requesttheai.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

	@Value("${openai.api.key}")
    private String apiKey;

    private final ConversationRepository conversationRepository;
	private final UserRepository userRepository;
	private final MessageRepository messageRepository;
	private final ModelRepository modelRepository;
	private final UsageRepository usageRepository;
	private final AccountRepository accountRepository;

	private com.openai.client.OpenAIClient buildClient() {
        return OpenAIOkHttpClient.builder()
                .apiKey(apiKey)
                .build();
    }

    public ConversationSummaryResponse createConversation(CreateConversationRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        String rawTitle = request.getTitle().trim();
        String shortTitle = rawTitle.length() > 40 ? rawTitle.substring(0, 40) + "..." : rawTitle;

        Conversation conversation = Conversation.builder()
                .title(shortTitle)
                .user(user)
                .build();

        conversationRepository.save(conversation);

        return ConversationSummaryResponse.builder()
                .id(conversation.getId())
                .title(conversation.getTitle())
                .createdAt(conversation.getCreatedAt())
                .build();
    }

	public SendMessageResponse sendMessage(SendMessageRequest request, String username) {
		User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

		Account userAccount = user.getAccount();
		if (userAccount.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
			throw new InsufficientCreditsException("You have no credits. Please add more to continue.");
		}

		Model model = modelRepository.findByName(request.getModelName())
				.orElseThrow(() -> new RuntimeException("Model not found"));

		Conversation conversation;
		if (request.getConversationId() == null) {
			String title = request.getContent().trim();
			String shortTitle = title.length() > 40 ? title.substring(0, 40) + "..." : title;
			conversation = Conversation.builder()
					.title(shortTitle)
					.user(user)
					.build();
			conversation = conversationRepository.save(conversation);
		} else {
			conversation = conversationRepository.findById(request.getConversationId())
					.orElseThrow(() -> new RuntimeException("Conversation not found"));
		}

		Message userMessage = Message.builder()
            .content(request.getContent())
            .messageType(MessageType.USER)
            .conversation(conversation)
            .model(model)
            .build();
    	messageRepository.save(userMessage);
		
		var paramsBuilder = ResponseCreateParams.builder()
            .input(request.getContent())
            .model(ChatModel.of(request.getModelName()))
            .store(true);

		if (request.getPreviousMessageOpenAiId() != null) {
			paramsBuilder.previousResponseId(request.getPreviousMessageOpenAiId());
		}

		OpenAIClient client = buildClient();
		var openAiResponse = client.responses().create(paramsBuilder.build());

		String aiText = openAiResponse.output().stream()
            .flatMap(item -> item.message().stream())
			.flatMap(message -> message.content().stream())
			.flatMap(content -> content.outputText().stream())
			.map(text -> text.text())
            .findFirst()
            .orElse("(Sin respuesta)");

		String openAiMessageId = openAiResponse.id();

		Message aiMessage = Message.builder()
            .content(aiText)
            .messageType(MessageType.MODEL)
            .conversation(conversation)
            .model(model)
            .openAiMessageId(openAiMessageId)
            .build();
    	messageRepository.save(aiMessage);

		int inputTokens = request.getContent().split("\\s+").length + 10;
		int outputTokens = aiText.split("\\s+").length + 10;
		int totalTokens = inputTokens + outputTokens;

		BigDecimal inputCost = model.getPriceInput().multiply(BigDecimal.valueOf(inputTokens));
		BigDecimal outputCost = model.getPriceOutput().multiply(BigDecimal.valueOf(outputTokens));
		BigDecimal realCost = inputCost.add(outputCost);
		BigDecimal platformRevenue = realCost.multiply(model.getProfitMargin());
		BigDecimal totalCost = realCost.add(platformRevenue);

		if (userAccount.getBalance().compareTo(totalCost) < 0) {
			throw new InsufficientCreditsException("The cost of this message exceeds your available balance. Please add more credits to continue.");
		}

		userAccount.setBalance(userAccount.getBalance().subtract(totalCost));
    	accountRepository.save(userAccount);

		List<Account> adminAccounts = accountRepository.findByRole(UserRole.ADMIN);
		if (adminAccounts.isEmpty()) {
			throw new RuntimeException("Admin account not found");
		}
		Account adminAccount = adminAccounts.get(0);
		adminAccount.setBalance(adminAccount.getBalance().add(platformRevenue));
		accountRepository.save(adminAccount);

		Usage usage = Usage.builder()
            .message(aiMessage)
            .tokens(totalTokens)
            .realAmount(realCost)
            .platformRevenue(platformRevenue)
            .totalAmount(totalCost)
			.status(TransactionStatus.SUCCESS)
            .build();
    	usageRepository.save(usage);

		conversation.setEndedAt(aiMessage.getCreatedAt());
    	conversationRepository.save(conversation);

		return SendMessageResponse.builder()
            .conversationId(conversation.getId())
            .userMessageId(userMessage.getId())
            .aiMessageId(aiMessage.getId())
			.openAiMessageId(openAiMessageId)
            .aiResponse(aiText)
            .inputTokens(inputTokens)
            .outputTokens(outputTokens)
            .totalCost(totalCost)
            .build();
	}
}