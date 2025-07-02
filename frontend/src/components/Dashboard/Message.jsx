import React from 'react';
import '../../styles/message.css';

const Message = ({ message }) => {
    const { text, sender, provider } = message;
    const isUser = sender === 'user';
    
    // Determine the icon based on the provider (for AI messages)
    const getAiIcon = () => {
        if (provider === 'openai') {
            return <div className="ai-icon openai-icon">O</div>; // Placeholder
        }
        if (provider === 'anthropic') {
            return <div className="ai-icon anthropic-icon">A</div>; // Placeholder
        }
        return null;
    };

    return (
        <div className={`message-wrapper ${isUser ? 'user-message' : 'ai-message'}`}>
            <div className="message-content">
                {!isUser && getAiIcon()}
                <p>{text}</p>
            </div>
        </div>
    );
};

export default Message; 