import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const ChatInput = ({ onSendMessage, modelProvider }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="chat-input-area">
            <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Example: 'Explain quantum computing in simple terms'"
                    className="chat-input"
                />
                <button type="submit" className="send-button">
                    <FaPaperPlane />
                </button>
            </form>
            <p className="footer-text">
                Request The AI can make mistakes. Consider checking important information.
            </p>
        </div>
    );
};

export default ChatInput; 