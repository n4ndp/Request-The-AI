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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import com.requesttheai.backend.dto.ConversationDetailResponse;
import com.requesttheai.backend.dto.ConversationSummaryResponse;
import com.requesttheai.backend.dto.CreateConversationRequest;
import com.requesttheai.backend.dto.MessageContent;
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
	private final ObjectMapper objectMapper = new ObjectMapper();
	private final RestTemplate restTemplate = new RestTemplate();

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

	// Verifica si el modelo soporta visión (imágenes)
	private boolean isVisionModel(String modelName) {
		return modelName != null && (
			modelName.equals("gpt-4o") ||
			modelName.equals("gpt-4o-mini") ||
			modelName.equals("gpt-4-vision-preview") ||
			modelName.equals("gpt-4-turbo-vision-preview")
		);
	}

	// Construye el mensaje de usuario apropiado según si es multimodal o no
	private ChatCompletionUserMessageParam buildUserMessage(SendMessageRequest request) {
		if (request.isMultimodal()) {
			// Para contenido multimodal, usar el formato JSON que OpenAI espera
			StringBuilder jsonContent = new StringBuilder();
			jsonContent.append("[");
			
			boolean first = true;
			for (MessageContent part : request.getMultimodalContent()) {
				if (!first) {
					jsonContent.append(",");
				}
				first = false;
				
				if ("text".equals(part.getType())) {
					jsonContent.append("{")
						.append("\"type\":\"text\",")
						.append("\"text\":\"")
						.append(part.getText().replace("\"", "\\\"").replace("\n", "\\n"))
						.append("\"")
						.append("}");
				} else if ("image_url".equals(part.getType()) && part.getImageUrl() != null) {
					jsonContent.append("{")
						.append("\"type\":\"image_url\",")
						.append("\"image_url\":{")
						.append("\"url\":\"")
						.append(part.getImageUrl().getUrl())
						.append("\"");
					
					if (part.getImageUrl().getDetail() != null && !part.getImageUrl().getDetail().isEmpty()) {
						jsonContent.append(",\"detail\":\"")
							.append(part.getImageUrl().getDetail())
							.append("\"");
					}
					
					jsonContent.append("}")
						.append("}");
				}
			}
			
			jsonContent.append("]");
			
			System.out.println("🖼️ Multimodal content JSON: " + jsonContent.toString());
			
			return ChatCompletionUserMessageParam.builder()
				.content(jsonContent.toString())
				.build();
		} else {
			// Para contenido de solo texto, usar el formato simple
			return ChatCompletionUserMessageParam.builder()
				.content(request.getContent())
				.build();
		}
	}

	// Método para hacer llamadas directas a OpenAI API con soporte multimodal
	private String callOpenAIDirectly(SendMessageRequest request, List<Message> conversationHistory, String modelName) throws Exception {
		// Construir la request JSON manualmente
		ObjectNode requestJson = objectMapper.createObjectNode();
		requestJson.put("model", modelName);
		requestJson.put("max_tokens", 1000);
		requestJson.put("temperature", 0.7);
		
		// Construir array de mensajes
		ArrayNode messagesArray = objectMapper.createArrayNode();
		
		// Agregar historial de conversación
		if (conversationHistory != null) {
			for (Message msg : conversationHistory) {
				ObjectNode messageObj = objectMapper.createObjectNode();
				messageObj.put("role", msg.getMessageType() == MessageType.USER ? "user" : "assistant");
				messageObj.put("content", msg.getContent());
				messagesArray.add(messageObj);
			}
		}
		
		// Agregar mensaje actual
		ObjectNode currentMessage = objectMapper.createObjectNode();
		currentMessage.put("role", "user");
		
		if (request.isMultimodal()) {
			// Para contenido multimodal, usar array de content parts
			ArrayNode contentArray = objectMapper.createArrayNode();
			
			for (MessageContent part : request.getMultimodalContent()) {
				ObjectNode contentPart = objectMapper.createObjectNode();
				
				if ("text".equals(part.getType())) {
					contentPart.put("type", "text");
					contentPart.put("text", part.getText());
				} else if ("image_url".equals(part.getType()) && part.getImageUrl() != null) {
					contentPart.put("type", "image_url");
					ObjectNode imageUrl = objectMapper.createObjectNode();
					imageUrl.put("url", part.getImageUrl().getUrl());
					if (part.getImageUrl().getDetail() != null) {
						imageUrl.put("detail", part.getImageUrl().getDetail());
					}
					contentPart.set("image_url", imageUrl);
				}
				
				contentArray.add(contentPart);
			}
			
			currentMessage.set("content", contentArray);
		} else {
			currentMessage.put("content", request.getContent());
		}
		
		messagesArray.add(currentMessage);
		requestJson.set("messages", messagesArray);
		
		// Configurar headers
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", "Bearer " + apiKey);
		headers.set("Content-Type", "application/json");
		
		// Hacer la llamada
		HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestJson), headers);
		ResponseEntity<String> response = restTemplate.exchange(
			"https://api.openai.com/v1/chat/completions",
			HttpMethod.POST,
			entity,
			String.class
		);
		
		// Parsear respuesta
		JsonNode responseJson = objectMapper.readTree(response.getBody());
		JsonNode choices = responseJson.get("choices");
		if (choices != null && choices.size() > 0) {
			JsonNode firstChoice = choices.get(0);
			JsonNode message = firstChoice.get("message");
			if (message != null) {
				JsonNode content = message.get("content");
				if (content != null) {
					return content.asText();
				}
			}
		}
		
		return "No response from OpenAI";
	}

	// Método para hacer llamadas directas a OpenAI API con soporte multimodal Y STREAMING SIMULADO
	private String callOpenAIDirectlyWithStreaming(SendMessageRequest request, List<Message> conversationHistory, String modelName, SseEmitter emitter) throws Exception {
		// Construir la request JSON manualmente
		ObjectNode requestJson = objectMapper.createObjectNode();
		requestJson.put("model", modelName);
		requestJson.put("max_tokens", 1000);
		requestJson.put("temperature", 0.7);
		
		// Construir array de mensajes
		ArrayNode messagesArray = objectMapper.createArrayNode();
		
		// Agregar historial de conversación
		if (conversationHistory != null) {
			for (Message msg : conversationHistory) {
				ObjectNode messageObj = objectMapper.createObjectNode();
				messageObj.put("role", msg.getMessageType() == MessageType.USER ? "user" : "assistant");
				messageObj.put("content", msg.getContent());
				messagesArray.add(messageObj);
			}
		}
		
		// Agregar mensaje actual
		ObjectNode currentMessage = objectMapper.createObjectNode();
		currentMessage.put("role", "user");
		
		if (request.isMultimodal()) {
			// Para contenido multimodal, usar array de content parts
			ArrayNode contentArray = objectMapper.createArrayNode();
			
			for (MessageContent part : request.getMultimodalContent()) {
				ObjectNode contentPart = objectMapper.createObjectNode();
				
				if ("text".equals(part.getType())) {
					contentPart.put("type", "text");
					contentPart.put("text", part.getText());
				} else if ("image_url".equals(part.getType()) && part.getImageUrl() != null) {
					contentPart.put("type", "image_url");
					ObjectNode imageUrl = objectMapper.createObjectNode();
					imageUrl.put("url", part.getImageUrl().getUrl());
					if (part.getImageUrl().getDetail() != null) {
						imageUrl.put("detail", part.getImageUrl().getDetail());
					}
					contentPart.set("image_url", imageUrl);
				}
				
				contentArray.add(contentPart);
			}
			
			currentMessage.set("content", contentArray);
		} else {
			currentMessage.put("content", request.getContent());
		}
		
		messagesArray.add(currentMessage);
		requestJson.set("messages", messagesArray);
		
		// Configurar headers
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", "Bearer " + apiKey);
		headers.set("Content-Type", "application/json");
		
		// Hacer la llamada
		HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestJson), headers);
		ResponseEntity<String> response = restTemplate.exchange(
			"https://api.openai.com/v1/chat/completions",
			HttpMethod.POST,
			entity,
			String.class
		);
		
		// Parsear respuesta
		JsonNode responseJson = objectMapper.readTree(response.getBody());
		JsonNode choices = responseJson.get("choices");
		String fullResponse = "No response from OpenAI";
		
		if (choices != null && choices.size() > 0) {
			JsonNode firstChoice = choices.get(0);
			JsonNode message = firstChoice.get("message");
			if (message != null) {
				JsonNode content = message.get("content");
				if (content != null) {
					fullResponse = content.asText();
				}
			}
		}
		
		// 🚀 SIMULAR STREAMING: Enviar la respuesta en chunks pequeños con delays
		System.out.println("🖼️ Simulating streaming for multimodal content...");
		String[] words = fullResponse.split(" ");
		StringBuilder currentChunk = new StringBuilder();
		
		for (int i = 0; i < words.length; i++) {
			currentChunk.append(words[i]).append(" ");
			
			// Enviar chunk cada 3-5 palabras para simular streaming
			if ((i + 1) % 4 == 0 || i == words.length - 1) {
				try {
					StreamMessageChunk contentChunk = StreamMessageChunk.builder()
							.type("content")
							.content(currentChunk.toString())
							.build();
					System.out.println("📤 Sending multimodal chunk: " + contentChunk.getContent());
					emitter.send(SseEmitter.event().data(contentChunk));
					
					// Pequeño delay para simular el streaming natural
					Thread.sleep(100);
					currentChunk.setLength(0);
				} catch (Exception e) {
					System.err.println("❌ Error sending multimodal chunk: " + e.getMessage());
					throw e;
				}
			}
		}
		
		return fullResponse;
	}

	// UPDATED METHOD: Build message history for OpenAI to maintain conversation memory with multimodal support
	private ChatCompletionCreateParams.Builder buildChatCompletionParams(Long conversationId, SendMessageRequest request, String modelName) {
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

		// Add the current user message (with multimodal support)
		paramsBuilder.addMessage(buildUserMessage(request));
		String textContent = request.getTextContent();
		System.out.println("💭 Added current USER message: " + textContent.substring(0, Math.min(50, textContent.length())) + "...");

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

		// Validar que el modelo soporta visión si se envían imágenes
		if (request.isMultimodal() && !isVisionModel(request.getModelName())) {
			throw new RuntimeException("Model " + request.getModelName() + " does not support image processing. Please use a vision-capable model like gpt-4o or gpt-4o-mini.");
		}

		Model model = modelRepository.findByName(request.getModelName())
				.orElseThrow(() -> new RuntimeException("Model not found"));

		Conversation conversation;
		if (request.getConversationId() == null) {
			String title = request.getTextContent().trim();
			// Si no hay texto, usar título genérico para contenido multimodal
			if (title.isEmpty()) {
				title = "Image conversation";
			}
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

		// Guardar el mensaje del usuario con el contenido apropiado
		String contentToSave = request.isMultimodal() ? 
			request.getTextContent() : // Para multimodal, guardamos solo el texto para compatibilidad
			request.getContent();
			
		Message userMessage = Message.builder()
            .content(contentToSave)
            .messageType(MessageType.USER)
            .conversation(conversation)
            .model(model)
            .build();
    	messageRepository.save(userMessage);

		String aiText;
		String openAiMessageId = "manual-" + System.currentTimeMillis(); // ID temporal para llamadas directas
		
		try {
			if (request.isMultimodal()) {
				// Para contenido multimodal, usar llamada directa
				List<Message> conversationHistory = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
				// Remover el último mensaje que acabamos de agregar
				conversationHistory = conversationHistory.subList(0, Math.max(0, conversationHistory.size() - 1));
				
				aiText = callOpenAIDirectly(request, conversationHistory, request.getModelName());
				System.out.println("🖼️ Response from direct OpenAI call: " + aiText.substring(0, Math.min(100, aiText.length())) + "...");
			} else {
				// Para contenido de solo texto, usar el SDK normal
				ChatCompletionCreateParams params = buildChatCompletionParams(
					conversation.getId(), 
					request, 
					request.getModelName()
				).build();
				
				OpenAIClient client = buildClient();
				ChatCompletion chatCompletion = client.chat().completions().create(params);
				
				aiText = chatCompletion.choices().get(0).message().content().orElse("(Sin respuesta)");
				openAiMessageId = chatCompletion.id();
			}
		} catch (Exception e) {
			System.err.println("❌ Error calling OpenAI: " + e.getMessage());
			e.printStackTrace();
			aiText = "I apologize, but I'm having trouble processing your request. Please try again.";
		}

		Message aiMessage = Message.builder()
            .content(aiText)
            .messageType(MessageType.MODEL)
            .conversation(conversation)
            .model(model)
            .openAiMessageId(openAiMessageId)
            .build();
    	messageRepository.save(aiMessage);

		int inputTokens = request.getTextContent().split("\\s+").length + 10;
		// Para imágenes, agregamos tokens adicionales (aproximación)
		if (request.isMultimodal()) {
			inputTokens += request.getMultimodalContent().size() * 200; // ~200 tokens por imagen
		}
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
		System.out.println("📝 Request data: " + (request.isMultimodal() ? 
			"[Multimodal content with " + request.getMultimodalContent().size() + " parts]" : 
			request.getContent()));
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

				// Validar que el modelo soporta visión si se envían imágenes
				if (request.isMultimodal() && !isVisionModel(request.getModelName())) {
					System.out.println("❌ Model " + request.getModelName() + " does not support vision");
					StreamMessageChunk errorChunk = StreamMessageChunk.builder()
							.type("error")
							.error("Model " + request.getModelName() + " does not support image processing. Please use a vision-capable model like gpt-4o or gpt-4o-mini.")
							.build();
					emitter.send(SseEmitter.event().data(errorChunk));
					emitter.complete();
					return;
				}

				Model model = modelRepository.findByName(request.getModelName())
						.orElseThrow(() -> new RuntimeException("Model not found"));
				System.out.println("🤖 Model found: " + model.getName());

				Conversation conversation;
				if (request.getConversationId() == null) {
					String title = request.getTextContent().trim();
					// Si no hay texto, usar título genérico para contenido multimodal
					if (title.isEmpty()) {
						title = "Image conversation";
					}
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

				// Guardar el mensaje del usuario con el contenido apropiado
				String contentToSave = request.isMultimodal() ? 
					request.getTextContent() : // Para multimodal, guardamos solo el texto para compatibilidad
					request.getContent();
					
				Message userMessage = Message.builder()
						.content(contentToSave)
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

				String aiText;
				
				try {
					if (request.isMultimodal()) {
						// Para contenido multimodal, usar llamada directa CON STREAMING SIMULADO
						System.out.println("🖼️ Processing multimodal content with streaming...");
						List<Message> conversationHistory = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
						// Remover el último mensaje que acabamos de agregar
						conversationHistory = conversationHistory.subList(0, Math.max(0, conversationHistory.size() - 1));
						
						aiText = callOpenAIDirectlyWithStreaming(request, conversationHistory, request.getModelName(), emitter);
						System.out.println("🖼️ Response from direct OpenAI call: " + aiText.substring(0, Math.min(100, aiText.length())) + "...");
						
					} else {
						// Para contenido de solo texto, usar streaming normal
						ChatCompletionCreateParams params = buildChatCompletionParams(
							conversation.getId(), 
							request, 
							request.getModelName()
						).build();
						System.out.println("🔧 OpenAI params created with conversation history for model: " + request.getModelName());

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
						}
						
						aiText = aiResponseBuilder.toString();
					}
				} catch (Exception e) {
					System.err.println("❌ Error in AI processing: " + e.getMessage());
					e.printStackTrace();
					StreamMessageChunk errorChunk = StreamMessageChunk.builder()
							.type("error")
							.error("Error processing request: " + e.getMessage())
							.build();
					emitter.send(SseEmitter.event().data(errorChunk));
					emitter.complete();
					return;
				}
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
				int inputTokens = request.getTextContent().split("\\s+").length + 10;
				// Para imágenes, agregamos tokens adicionales (aproximación)
				if (request.isMultimodal()) {
					inputTokens += request.getMultimodalContent().size() * 200; // ~200 tokens por imagen
				}
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