import React from 'react';
import { FaBrain, FaWandMagicSparkles } from 'react-icons/fa6';
import '../../styles/message.css';

const Message = ({ message }) => {
    const { text, sender, provider, isStreaming, isError, multimodalContent } = message;
    const isUser = sender === 'user';
    
    // Determine the icon based on the provider (for AI messages)
    const getAiIcon = () => {
        if (provider === 'openai') {
            return (
                <div className="ai-icon openai-icon">
                    <FaBrain />
                </div>
            );
        }
        if (provider === 'anthropic') {
            return (
                <div className="ai-icon anthropic-icon">
                    <FaWandMagicSparkles />
                </div>
            );
        }
        return null;
    };

    // Streaming indicator component
    const StreamingIndicator = () => (
        <div className="streaming-indicator">
            <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );

    // Render multimodal content for user messages
    const renderMultimodalContent = () => {
        if (!multimodalContent) return null;

        return (
            <div className="multimodal-content">
                {multimodalContent.map((part, index) => {
                    if (part.type === 'text') {
                        return (
                            <div key={index} className="text-content">
                                {part.text}
                            </div>
                        );
                    } else if (part.type === 'image_url') {
                        return (
                            <div key={index} className="image-content">
                                <img 
                                    src={part.imageUrl.url} 
                                    alt="User uploaded image"
                                    className="message-image"
                                />
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        );
    };

    if (isUser) {
        return (
            <div className="message-wrapper user-message">
                <div className="user-message-content">
                    <div className="user-message-bubble">
                        {multimodalContent ? renderMultimodalContent() : text}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`message-wrapper ai-message ${isError ? 'error-message' : ''}`}>
            <div className="ai-message-content">
                {getAiIcon()}
                <div className="ai-message-text">
                    {text}
                    {isStreaming && text === '' && <StreamingIndicator />}
                    {isStreaming && text !== '' && (
                        <span className="streaming-cursor">|</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Message; 