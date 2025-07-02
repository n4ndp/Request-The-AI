import React from 'react';
import { FaBrain, FaWandMagicSparkles } from 'react-icons/fa6';
import '../../styles/message.css';

const Message = ({ message }) => {
    const { text, sender, provider } = message;
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

    if (isUser) {
        return (
            <div className="message-wrapper user-message">
                <div className="user-message-content">
                    <div className="user-message-bubble">
                        {text}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="message-wrapper ai-message">
            <div className="ai-message-content">
                {getAiIcon()}
                <div className="ai-message-text">
                    {text}
                </div>
            </div>
        </div>
    );
};

export default Message; 