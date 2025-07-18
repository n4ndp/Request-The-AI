import React, { useState, useEffect, useRef, useMemo } from 'react';
import ChatInput from './ChatInput';
import Message from './Message';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import { FaBrain, FaWandMagicSparkles, FaChevronDown, FaImage, FaInfoCircle } from 'react-icons/fa6';
import '../../styles/chatview.css';
import chatService from '../../services/chatService';
import Swal from 'sweetalert2';

const ChatView = ({ 
    models, 
    selectedModel, 
    onModelChange, 
    modelProvider, 
    onInsufficientCredits, 
    userBalance,
    onBalanceChange,
    currentConversation,
    initialMessages,
    onConversationCreated
}) => {
    const [messages, setMessages] = useState([]);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
    const [hoveredModelId, setHoveredModelId] = useState(null);
    const messageListRef = useRef(null);
    const dropdownRef = useRef(null);

    const groupedModels = useMemo(() => {
        return models.reduce((acc, model) => {
            const provider = model.provider || 'Unknown';
            if (!acc[provider]) {
                acc[provider] = [];
            }
            acc[provider].push(model);
            return acc;
        }, {});
    }, [models]);

    // Cargar mensajes iniciales cuando cambia la conversación seleccionada
    useEffect(() => {
        // Solo cargar mensajes iniciales cuando el usuario selecciona una conversación existente
        if (currentConversation && initialMessages && initialMessages.length > 0) {
            setMessages(initialMessages);
        } else if (!currentConversation) {
            // Limpiar mensajes solo cuando explícitamente se inicia un nuevo chat
            setMessages([]);
        }
    }, [initialMessages]);

    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTo({
                top: messageListRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleModelSelect = (model) => {
        onModelChange(model);
        setDropdownOpen(false);
    };

    const handleAddCredits = () => {
        // Cerrar el modal de créditos insuficientes y disparar el evento para abrir el modal de recarga
        setShowInsufficientCreditsModal(false);
        onInsufficientCredits();
    };

    const handleSendMessage = async (text, multimodalContent = null) => {
        console.log('🚀 ChatView: Starting to send message:', text || 'multimodal content');
        console.log('📊 ChatView: Current conversation:', currentConversation);
        console.log('📊 ChatView: Current messages count:', messages.length);
        console.log('🖼️ ChatView: Multimodal content:', multimodalContent);
        
        // Verificar si el usuario tiene créditos suficientes antes de enviar
        if (userBalance <= 0) {
            console.log('❌ ChatView: Insufficient credits, showing modal');
            setShowInsufficientCreditsModal(true);
            return;
        }
        
        // Crear el mensaje de usuario con soporte para contenido multimodal
        const userMessage = multimodalContent ? {
            text: multimodalContent.find(part => part.type === 'text')?.text || 'Image message',
            sender: 'user',
            multimodalContent: multimodalContent
        } : {
            text,
            sender: 'user'
        };
        
        setMessages(prevMessages => {
            const newMessages = [...prevMessages, userMessage];
            console.log('👤 ChatView: Added user message, new count:', newMessages.length);
            return newMessages;
        });

        // Create an initial AI message that will be updated with streaming content
        const tempId = `ai-msg-${Date.now()}`;
        const aiMessage = {
            id: tempId,
            text: '',
            sender: 'ai',
            provider: modelProvider,
            conversationId: currentConversation?.id || null,
            openAiMessageId: null,
            isStreaming: true
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        
        try {
            // Si no hay conversación actual, se creará una automáticamente en el backend
            const conversationId = currentConversation?.id || null;
            
            // Construir el request data basado en si es multimodal o no
            const streamRequestData = multimodalContent ? {
                multimodalContent: multimodalContent,
                modelName: selectedModel.name,
                conversationId: conversationId,
                previousMessageOpenAiId: messages.length > 0 ? messages[messages.length - 1].openAiMessageId : null
            } : {
                content: text,
                modelName: selectedModel.name,
                conversationId: conversationId,
                previousMessageOpenAiId: messages.length > 0 ? messages[messages.length - 1].openAiMessageId : null
            };

            chatService.sendMessageStream(
                streamRequestData,
                // onChunk callback
                (chunk) => {
                    if (chunk.type === 'start') {
                        setMessages(prevMessages => prevMessages.map(msg => 
                            msg.id === tempId 
                                ? { ...msg, conversationId: chunk.conversationId, isStreaming: true }
                                : msg
                        ));

                        if (!currentConversation && chunk.conversationId) {
                            // Crear título apropiado para el tipo de mensaje
                            let title;
                            if (multimodalContent) {
                                const textPart = multimodalContent.find(part => part.type === 'text');
                                title = textPart ? textPart.text : 'Image conversation';
                            } else {
                                title = text || 'New conversation';
                            }
                            
                            const shortTitle = title.length > 40 ? title.substring(0, 40) + "..." : title;
                            const newConversation = {
                                id: chunk.conversationId,
                                title: shortTitle,
                                createdAt: new Date().toISOString()
                            };
                            onConversationCreated(newConversation);
                        }
                    } else if (chunk.type === 'content') {
                        console.log('📝 Adding content chunk:', chunk.content);
                        setMessages(prevMessages => prevMessages.map(msg =>
                            msg.id === tempId
                                ? { 
                                    ...msg, 
                                    text: msg.text + chunk.content,
                                    isStreaming: true 
                                }
                                : msg
                        ));
                    } else if (chunk.type === 'end') {
                        setMessages(prevMessages => prevMessages.map(msg =>
                            msg.id === tempId
                                ? { ...msg, 
                                    conversationId: chunk.conversationId, 
                                    openAiMessageId: chunk.aiMessageId, 
                                    isStreaming: false 
                                }
                                : msg
                        ));
                        if (chunk.totalCost && onBalanceChange) {
                            onBalanceChange(userBalance - chunk.totalCost);
                        }
                    } else if (chunk.type === 'error') {
                        setMessages(prevMessages => prevMessages.map(msg =>
                            msg.id === tempId
                                ? { ...msg, 
                                    text: 'Error: ' + chunk.error, 
                                    isStreaming: false, 
                                    isError: true 
                                }
                                : msg
                        ));

                        if (chunk.error.includes('Insufficient credits')) {
                            onInsufficientCredits();
                            Swal.fire({
                                icon: 'warning',
                                title: 'No tienes créditos',
                                text: 'Por favor, añade más créditos para continuar.',
                                confirmButtonText: 'Entendido'
                            });
                        }
                    }
                },
                // onError callback
                (error) => {
                    setMessages(prevMessages => prevMessages.map(msg =>
                        msg.id === tempId
                            ? { ...msg, 
                                text: 'Error: Failed to send message. Please try again.', 
                                isStreaming: false, 
                                isError: true 
                            }
                            : msg
                    ));
                    
                    if (error.message.includes('Insufficient credits')) {
                        onInsufficientCredits();
                        Swal.fire({
                            icon: 'warning',
                            title: 'No tienes créditos',
                            text: 'Por favor, añade más créditos para continuar.',
                            confirmButtonText: 'Entendido'
                        });
                    }
                },
                // onComplete callback
                () => {
                    setMessages(prevMessages => prevMessages.map(msg =>
                        msg.id === tempId ? { ...msg, isStreaming: false } : msg
                    ));
                }
            );
        } catch (error) {
            setMessages(prevMessages => prevMessages.map(msg =>
                msg.id === tempId
                    ? { ...msg, 
                        text: 'Error: Failed to start streaming. Please try again.', 
                        isStreaming: false, 
                        isError: true 
                    }
                    : msg
            ));
        }
    };

    const ModelIcon = modelProvider === 'openai' ? FaBrain : FaWandMagicSparkles;

    // Función para determinar si un modelo acepta imágenes
    const supportsImages = (modelName) => {
        const imageModels = [
            'gpt-4o', 'gpt-4o-mini', 'gpt-4-vision', 'gpt-4-turbo', 
            'claude-3-sonnet', 'claude-3-haiku', 'claude-3-opus',
            'gemini-pro-vision', 'gemini-1.5-pro', 'gemini-1.5-flash',
            'llama-3.1-8b-instruct', 'llama-3.1-70b-instruct',
            'mistral-large', 'mistral-medium'
        ];
        
        const modelNameLower = modelName.toLowerCase();
        return imageModels.some(name => modelNameLower.includes(name.toLowerCase()));
    };

    // Función para formatear el precio
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 6
        }).format(price);
    };

    // Función para renderizar el tooltip del modelo
    const ModelTooltip = ({ model, isVisible }) => {
        if (!isVisible) return null;

        return (
            <div className="model-tooltip">
                <div className="tooltip-header">
                    <h4>{model.name}</h4>
                    <span className="provider-badge">{model.provider}</span>
                </div>
                
                {model.description && (
                    <div className="tooltip-description">
                        <p>{model.description}</p>
                    </div>
                )}
                
                <div className="tooltip-pricing">
                    <div className="price-item">
                        <span className="price-label">Input:</span>
                        <span className="price-value">{formatPrice(model.priceInput)}/token</span>
                    </div>
                    <div className="price-item">
                        <span className="price-label">Output:</span>
                        <span className="price-value">{formatPrice(model.priceOutput)}/token</span>
                    </div>
                </div>
                
                <div className="tooltip-features">
                    <div className="feature-item">
                        <FaImage className={`feature-icon ${supportsImages(model.name) ? 'supported' : 'not-supported'}`} />
                        <span className={`feature-text ${supportsImages(model.name) ? 'supported' : 'not-supported'}`}>
                            {supportsImages(model.name) ? 'Soporta imágenes' : 'No soporta imágenes'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`chat-view ${messages.length > 0 ? 'has-messages' : ''}`}>
            <div className="model-selector-container" ref={dropdownRef}>
                <div className="model-selector" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                    <div className={`model-button ${modelProvider}`}>
                        <ModelIcon className="model-icon" />
                        <span>{selectedModel ? selectedModel.name : 'Select Model'}</span>
                        <FaChevronDown className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`} />
                    </div>
                </div>
                {isDropdownOpen && (
                    <div className="model-dropdown">
                        {Object.entries(groupedModels).map(([provider, providerModels]) => (
                            <div key={provider} className="provider-group">
                                <h5 className="provider-name">{provider}</h5>
                                {providerModels.map(model => (
                                    <div 
                                        key={model.id} 
                                        className={`model-option ${selectedModel && selectedModel.id === model.id ? 'selected' : ''}`}
                                        onClick={() => handleModelSelect(model)}
                                        onMouseEnter={() => setHoveredModelId(model.id)}
                                        onMouseLeave={() => setHoveredModelId(null)}
                                    >
                                        <div className="model-option-content">
                                            <span className="model-name">{model.name}</span>
                                            {supportsImages(model.name) && (
                                                <FaImage className="image-support-icon" title="Soporta imágenes" />
                                            )}
                                        </div>
                                        <ModelTooltip 
                                            model={model} 
                                            isVisible={hoveredModelId === model.id}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="message-list" ref={messageListRef}>
                {messages.length === 0 ? (
                    <div className="welcome-container">
                        <h1 className="welcome-title">
                            Welcome to Request The AI
                        </h1>
                        <p className="welcome-subtitle">
                            The power of AI at your service - Tame the knowledge !
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => (
                            <Message key={index} message={msg} />
                        ))}
                    </>
                )}
            </div>
            
            <ChatInput 
                onSendMessage={handleSendMessage} 
                modelProvider={modelProvider}
                selectedModel={selectedModel} 
            />
            
            <InsufficientCreditsModal 
                show={showInsufficientCreditsModal}
                onHide={() => setShowInsufficientCreditsModal(false)}
                userBalance={userBalance}
                onAddCredits={handleAddCredits}
            />
        </div>
    );
};

export default ChatView; 