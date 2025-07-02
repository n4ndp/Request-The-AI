import React, { useState, useEffect, useRef } from 'react';
import ChatInput from './ChatInput';
import Message from './Message';
import { FaBrain, FaUsers, FaRocket } from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import '../../styles/chatview.css';

const ChatView = ({ modelProvider, setModelProvider }) => {
    const [messages, setMessages] = useState([]);
    const messageListRef = useRef(null);

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
    
    const handleModelChange = (e) => {
        const newProvider = e.target.value.includes('claude') ? 'anthropic' : 'openai';
        setModelProvider(newProvider);
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

    return (
        <div className={`chat-view ${modelProvider}-theme ${messages.length > 0 ? 'has-messages' : ''}`}>
            <div className="model-selector-container">
                <div className="model-selector" onClick={() => setModelProvider(modelProvider === 'openai' ? 'anthropic' : 'openai')}>
                    {modelProvider === 'openai' ? (
                        <div className="model-button openai">
                            <FaBrain className="model-icon" />
                            <span>GPT o4</span>
                        </div>
                    ) : (
                        <div className="model-button anthropic">
                            <FaWandMagicSparkles className="model-icon" />
                            <span>3.7 Sonnet</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="message-list" ref={messageListRef}>
                {messages.length === 0 ? (
                    <div className="welcome-container">
                        <h1 className="welcome-title">
                            Welcome to <span className="brand-name">{modelProvider === 'openai' ? 'ChatGPT' : 'Claude'}</span>
                        </h1>
                        <p className="welcome-subtitle">The power of AI at your service - Tame the knowledge !</p>
                        <div className="features-grid">
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <FaBrain />
                                </div>
                                <h3 className="feature-title">Clear and precise</h3>
                                <p className="feature-description">Pariatur sint laborum cillum aute consectetur irure.</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <FaUsers />
                                </div>
                                <h3 className="feature-title">Personalized answers</h3>
                                <p className="feature-description">Pariatur sint laborum cillum aute consectetur irure.</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <FaRocket />
                                </div>
                                <h3 className="feature-title">Increased efficiency</h3>
                                <p className="feature-description">Pariatur sint laborum cillum aute consectetur irure.</p>
                            </div>
                        </div>
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