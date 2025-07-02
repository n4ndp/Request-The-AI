import React, { useState, useEffect, useRef, useMemo } from 'react';
import ChatInput from './ChatInput';
import Message from './Message';
import { FaBrain, FaWandMagicSparkles, FaChevronDown } from 'react-icons/fa6';
import '../../styles/chatview.css';

const ChatView = ({ models, selectedModel, onModelChange, modelProvider }) => {
    const [messages, setMessages] = useState([]);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
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

    const handleSendMessage = (text) => {
        const userMessage = { text, sender: 'user' };
        const aiMessage = { 
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ut justo ac nulla luctus semper. Aenean congue auctor massa, a malesuada massa porttitor quis. Suspendisse id blandit at, tincidunt id, id tincidunt. Vivamus eleifend, interdum a, mattis et, dictum non. Donec a porta quam, ornare fermentum sapien. Etiam lacinia fringilla dignissim. In faucibus est urna, id tincidunt odio molestie vel. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vel libero, interdum a, mattis et, dictum non.', 
            sender: 'ai',
            provider: modelProvider 
        };
        setMessages([...messages, userMessage, aiMessage]);
    };

    const ModelIcon = modelProvider === 'openai' ? FaBrain : FaWandMagicSparkles;

    return (
        <div className={`chat-view ${modelProvider}-theme ${messages.length > 0 ? 'has-messages' : ''}`}>
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
                                    >
                                        {model.name}
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
                        <p className="welcome-subtitle">The power of AI at your service - Tame the knowledge !</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => (
                            <Message key={index} message={msg} />
                        ))}
                    </>
                )}
            </div>
            
            <ChatInput onSendMessage={handleSendMessage} modelProvider={modelProvider} />
        </div>
    );
};

export default ChatView; 