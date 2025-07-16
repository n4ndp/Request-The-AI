package com.requesttheai.backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.transaction.annotation.Transactional;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionChunk;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.openai.models.chat.completions.ChatCompletionUserMessageParam;
import com.openai.models.chat.completions.ChatCompletionAssistantMessageParam;
import com.openai.core.http.StreamResponse;
import com.requesttheai.backend.dto.ConversationDetailResponse;
import com.requesttheai.backend.dto.ConversationSummaryResponse;
import com.requesttheai.backend.dto.CreateConversationRequest;
import com.requesttheai.backend.dto.MessageResponse;
import com.requesttheai.backend.dto.SendMessageRequest;
import com.requesttheai.backend.dto.SendMessageResponse;
import com.requesttheai.backend.dto.StreamMessageChunk;
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

	private OpenAIClient buildClient() {
        return OpenAIOkHttpClient.builder()
                .apiKey(apiKey)
                .build();
    }

	private boolean isValidOpenAIModel(String modelName) {
		// Lista de modelos válidos de OpenAI que soportan streaming
		return modelName != null && (
			modelName.equals("gpt-4o") ||
			modelName.equals("gpt-4o-mini") ||
			modelName.equals("gpt-4") ||
			modelName.equals("gpt-4-turbo") ||
			modelName.equals("gpt-3.5-turbo") ||
			modelName.startsWith("gpt-4") ||
			modelName.startsWith("gpt-3.5")
		);
	}

	// NEW METHOD: Build message history for OpenAI to maintain conversation memory
	private ChatCompletionCreateParams.Builder buildChatCompletionParams(Long conversationId, String currentMessage, String modelName) {
		ChatCompletionCreateParams.Builder paramsBuilder = ChatCompletionCreateParams.builder()
			.model(ChatModel.of(modelName));

		// If there's an existing conversation, load the message history
		if (conversationId != null) {
			List<Message> previousMessages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
			System.out.println("🧠 Loading " + previousMessages.size() + " previous messages for conversation memory");
			
			// Add all previous messages to maintain context
			for (Message message : previousMessages) {
				if (message.getMessageType() == MessageType.USER) {
					paramsBuilder.addMessage(ChatCompletionUserMessageParam.builder()
						.content(message.getContent())
						.build());
					System.out.println("💭 Added USER message to history: " + message.getContent().substring(0, Math.min(50, message.getContent().length())) + "...");
				} else if (message.getMessageType() == MessageType.MODEL) {
					paramsBuilder.addMessage(ChatCompletionAssistantMessageParam.builder()
						.content(message.getContent())
						.build());
					System.out.println("💭 Added ASSISTANT message to history: " + message.getContent().substring(0, Math.min(50, message.getContent().length())) + "...");
				}
			}
		} else {
			System.out.println("🧠 No existing conversation, starting fresh");
		}

		// Add the current user message
		paramsBuilder.addMessage(ChatCompletionUserMessageParam.builder()
			.content(currentMessage)
			.build());
		System.out.println("💭 Added current USER message: " + currentMessage.substring(0, Math.min(50, currentMessage.length())) + "...");

		return paramsBuilder;
	}

	public List<ConversationSummaryResponse> getUserConversations(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

		List<Conversation> conversations = conversationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

		return conversations.stream()
				.map(conversation -> ConversationSummaryResponse.builder()
						.id(conversation.getId())
						.title(conversation.getTitle())
						.createdAt(conversation.getCreatedAt())
						.endedAt(conversation.getEndedAt())
						.messageCount(conversation.getMessages().size())
						.build())
				.toList();
	}

	public ConversationDetailResponse getConversationDetail(Long conversationId, String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

		Conversation conversation = conversationRepository.findByIdAndUserIdWithMessages(conversationId, user.getId())
				.orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));

		List<MessageResponse> messageResponses = conversation.getMessages().stream()
				.map(message -> MessageResponse.builder()
						.id(message.getId())
						.content(message.getContent())
						.messageType(message.getMessageType())
						.createdAt(message.getCreatedAt())
						.openAiMessageId(message.getOpenAiMessageId())
						.modelName(message.getModel().getName())
						.build())
				.toList();

		return ConversationDetailResponse.builder()
				.id(conversation.getId())
				.title(conversation.getTitle())
				.createdAt(conversation.getCreatedAt())
				.endedAt(conversation.getEndedAt())
				.messages(messageResponses)
				.build();
	}

	@Transactional
	public void deleteConversation(Long conversationId, String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

		Conversation conversation = conversationRepository.findByIdAndUserIdWithMessages(conversationId, user.getId())
				.orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));

		// Manually delete usage records associated with each message
		for (Message message : conversation.getMessages()) {
			usageRepository.setNullMessageByMessageId(message.getId());
		}

		// Now, deleting the conversation should cascade to messages without integrity issues
		conversationRepository.delete(conversation);
	}

    @Transactional
    public void deleteAllConversations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<Conversation> conversations = conversationRepository.findByUserId(user.getId());

        for (Conversation conversation : conversations) {
            for (Message message : conversation.getMessages()) {
                usageRepository.setNullMessageByMessageId(message.getId());
            }
            conversationRepository.delete(conversation);
        }
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
                .endedAt(conversation.getEndedAt())
                .messageCount(0)
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

		// FIXED: Build params with conversation history BEFORE saving current message
		ChatCompletionCreateParams params = buildChatCompletionParams(
			conversation.getId(), 
			request.getContent(), 
			request.getModelName()
		).build();

		Message userMessage = Message.builder()
            .content(request.getContent())
            .messageType(MessageType.USER)
            .conversation(conversation)
            .model(model)
            .build();
    	messageRepository.save(userMessage);

		OpenAIClient client = buildClient();
		ChatCompletion chatCompletion = client.chat().completions().create(params);

		String aiText = chatCompletion.choices().get(0).message().content().orElse("(Sin respuesta)");
		String openAiMessageId = chatCompletion.id();

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

	public SseEmitter sendMessageStream(SendMessageRequest request, String username) {
		System.out.println("🚀 Starting stream for user: " + username);
		System.out.println("📝 Request data: " + request.getContent());
		System.out.println("🤖 Model: " + request.getModelName());
		
		SseEmitter emitter = new SseEmitter(0L); // No timeout
		System.out.println("📡 SseEmitter created");

		CompletableFuture.runAsync(() -> {
			try {
				System.out.println("🔄 Starting async processing...");
				
				User user = userRepository.findByUsername(username)
						.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
				System.out.println("👤 User found: " + user.getId());

				Account userAccount = user.getAccount();
				if (userAccount.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
					System.out.println("❌ Insufficient credits for user: " + username);
					StreamMessageChunk errorChunk = StreamMessageChunk.builder()
							.type("error")
							.error("You have no credits. Please add more to continue.")
							.build();
					emitter.send(SseEmitter.event().data(errorChunk));
					emitter.complete();
					return;
				}
				System.out.println("💰 User has credits: " + userAccount.getBalance());

				Model model = modelRepository.findByName(request.getModelName())
						.orElseThrow(() -> new RuntimeException("Model not found"));
				System.out.println("🤖 Model found: " + model.getName());

				Conversation conversation;
				if (request.getConversationId() == null) {
					String title = request.getContent().trim();
					String shortTitle = title.length() > 40 ? title.substring(0, 40) + "..." : title;
					conversation = Conversation.builder()
							.title(shortTitle)
							.user(user)
							.build();
					conversation = conversationRepository.save(conversation);
					System.out.println("💬 New conversation created: " + conversation.getId());
				} else {
					conversation = conversationRepository.findById(request.getConversationId())
							.orElseThrow(() -> new RuntimeException("Conversation not found"));
					System.out.println("💬 Using existing conversation: " + conversation.getId());
				}

				// FIXED: Load conversation history BEFORE saving current message
				ChatCompletionCreateParams params = buildChatCompletionParams(
					conversation.getId(), 
					request.getContent(), 
					request.getModelName()
				).build();
				System.out.println("🔧 OpenAI params created with conversation history for model: " + request.getModelName());

				Message userMessage = Message.builder()
						.content(request.getContent())
						.messageType(MessageType.USER)
						.conversation(conversation)
						.model(model)
						.build();
				messageRepository.save(userMessage);
				System.out.println("✅ User message saved: " + userMessage.getId());

				// Send start event
				StreamMessageChunk startChunk = StreamMessageChunk.builder()
						.type("start")
						.conversationId(conversation.getId())
						.userMessageId(userMessage.getId())
						.build();
				System.out.println("📤 Sending start event: " + startChunk);
				emitter.send(SseEmitter.event().data(startChunk));

				// Validate model name before making request
				String modelName = request.getModelName();
				if (!isValidOpenAIModel(modelName)) {
					System.err.println("❌ Invalid OpenAI model name: " + modelName);
					StreamMessageChunk errorChunk = StreamMessageChunk.builder()
							.type("error")
							.error("Invalid model name: " + modelName + ". Please use a valid OpenAI model.")
							.build();
					emitter.send(SseEmitter.event().data(errorChunk));
					emitter.complete();
					return;
				}

				OpenAIClient client = buildClient();
				StringBuilder aiResponseBuilder = new StringBuilder();
				System.out.println("🌐 Starting OpenAI streaming request...");

				try (StreamResponse<ChatCompletionChunk> streamResponse = client.chat().completions().createStreaming(params)) {
					System.out.println("✅ OpenAI stream created successfully");
					
					streamResponse.stream().forEach(chunk -> {
						System.out.println("📦 Received chunk from OpenAI: " + chunk);
						
						if (!chunk.choices().isEmpty()) {
							String content = chunk.choices().get(0).delta().content().orElse("");
							System.out.println("📝 Content from chunk: '" + content + "'");
							
							if (!content.isEmpty()) {
								aiResponseBuilder.append(content);
								try {
									StreamMessageChunk contentChunk = StreamMessageChunk.builder()
											.type("content")
											.content(content)
											.build();
									System.out.println("📤 Sending content chunk: " + contentChunk);
									emitter.send(SseEmitter.event().data(contentChunk));
								} catch (Exception e) {
									System.err.println("❌ Error sending content chunk: " + e.getMessage());
									throw new RuntimeException("Error sending streaming content", e);
								}
							}
						} else {
							System.out.println("⚠️ Chunk has no choices");
						}
					});
				} catch (Exception openAiException) {
					System.err.println("💥 OpenAI API Error: " + openAiException.getMessage());
					openAiException.printStackTrace();
					StreamMessageChunk errorChunk = StreamMessageChunk.builder()
							.type("error")
							.error("OpenAI API Error: " + openAiException.getMessage())
							.build();
					emitter.send(SseEmitter.event().data(errorChunk));
					emitter.complete();
					return;
				}

				String aiText = aiResponseBuilder.toString();
				System.out.println("🤖 Complete AI response: '" + aiText + "'");
				
				if (aiText.isEmpty()) {
					aiText = "(Sin respuesta)";
					System.out.println("⚠️ AI response was empty, using default message");
				}

				// Save AI message
				Message aiMessage = Message.builder()
						.content(aiText)
						.messageType(MessageType.MODEL)
						.conversation(conversation)
						.model(model)
						.build();
				messageRepository.save(aiMessage);
				System.out.println("✅ AI message saved: " + aiMessage.getId());

				// Calculate costs
				int inputTokens = request.getContent().split("\\s+").length + 10;
				int outputTokens = aiText.split("\\s+").length + 10;
				int totalTokens = inputTokens + outputTokens;
				System.out.println("💰 Token calculation - Input: " + inputTokens + ", Output: " + outputTokens + ", Total: " + totalTokens);

				BigDecimal inputCost = model.getPriceInput().multiply(BigDecimal.valueOf(inputTokens));
				BigDecimal outputCost = model.getPriceOutput().multiply(BigDecimal.valueOf(outputTokens));
				BigDecimal realCost = inputCost.add(outputCost);
				BigDecimal platformRevenue = realCost.multiply(model.getProfitMargin());
				BigDecimal totalCost = realCost.add(platformRevenue);
				System.out.println("💸 Total cost calculated: " + totalCost);

				if (userAccount.getBalance().compareTo(totalCost) < 0) {
					System.out.println("❌ Insufficient balance for cost: " + totalCost);
					StreamMessageChunk errorChunk = StreamMessageChunk.builder()
							.type("error")
							.error("The cost of this message exceeds your available balance. Please add more credits to continue.")
							.build();
					emitter.send(SseEmitter.event().data(errorChunk));
					emitter.complete();
					return;
				}

				// Update balances
				userAccount.setBalance(userAccount.getBalance().subtract(totalCost));
				accountRepository.save(userAccount);
				System.out.println("💰 User balance updated: " + userAccount.getBalance());

				List<Account> adminAccounts = accountRepository.findByRole(UserRole.ADMIN);
				if (!adminAccounts.isEmpty()) {
					Account adminAccount = adminAccounts.get(0);
					adminAccount.setBalance(adminAccount.getBalance().add(platformRevenue));
					accountRepository.save(adminAccount);
					System.out.println("💰 Admin balance updated: " + adminAccount.getBalance());
				}

				// Save usage
				Usage usage = Usage.builder()
						.message(aiMessage)
						.tokens(totalTokens)
						.realAmount(realCost)
						.platformRevenue(platformRevenue)
						.totalAmount(totalCost)
						.status(TransactionStatus.SUCCESS)
						.build();
				usageRepository.save(usage);
				System.out.println("📊 Usage record saved");

				// Update conversation
				conversation.setEndedAt(aiMessage.getCreatedAt());
				conversationRepository.save(conversation);
				System.out.println("💬 Conversation updated");

				// Send end event
				StreamMessageChunk endChunk = StreamMessageChunk.builder()
						.type("end")
						.conversationId(conversation.getId())
						.userMessageId(userMessage.getId())
						.aiMessageId(aiMessage.getId())
						.inputTokens(inputTokens)
						.outputTokens(outputTokens)
						.totalCost(totalCost)
						.build();
				System.out.println("📤 Sending end event: " + endChunk);
				emitter.send(SseEmitter.event().data(endChunk));
				emitter.complete();
				System.out.println("🏁 Stream completed successfully");

			} catch (Exception e) {
				System.err.println("💥 Error in streaming: " + e.getMessage());
				e.printStackTrace();
				try {
					StreamMessageChunk errorChunk = StreamMessageChunk.builder()
							.type("error")
							.error("Error processing message: " + e.getMessage())
							.build();
					emitter.send(SseEmitter.event().data(errorChunk));
					emitter.completeWithError(e);
				} catch (Exception sendError) {
					System.err.println("💥 Error sending error chunk: " + sendError.getMessage());
					emitter.completeWithError(sendError);
				}
			}
		});

		return emitter;
	}
}