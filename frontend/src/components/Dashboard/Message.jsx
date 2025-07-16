import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { FaBrain, FaWandMagicSparkles, FaCopy } from 'react-icons/fa6';
import '../../styles/message.css';

const Message = ({ message }) => {
    const { text, sender, provider, isStreaming, isError, multimodalContent } = message;
    const isUser = sender === 'user';
    
    // Copy code to clipboard function
    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code).then(() => {
            // You could add a toast notification here if desired
        });
    };

    // Custom components for ReactMarkdown
    const markdownComponents = {
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && language) {
                return (
                    <div className="code-block-wrapper">
                        <div className="code-block-header">
                            <span className="code-language">{language}</span>
                            <button 
                                className="copy-code-btn"
                                onClick={() => copyToClipboard(codeString)}
                                title="Copiar código"
                            >
                                <FaCopy />
                            </button>
                        </div>
                        <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={language}
                            PreTag="div"
                            customStyle={{
                                margin: 0,
                                borderRadius: '0 0 8px 8px',
                                fontSize: '14px',
                                lineHeight: '1.4',
                                maxWidth: '100%',
                                overflowX: 'auto',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                            wrapLines={true}
                            wrapLongLines={true}
                            {...props}
                        >
                            {codeString}
                        </SyntaxHighlighter>
                    </div>
                );
            }

            return (
                <code className="inline-code" {...props}>
                    {children}
                </code>
            );
        },
        // Customize other elements to ensure they respect existing styles
        p: ({ children }) => <p className="markdown-paragraph">{children}</p>,
        h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
        h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
        h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
        h5: ({ children }) => <h5 className="markdown-h5">{children}</h5>,
        h6: ({ children }) => <h6 className="markdown-h6">{children}</h6>,
        ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
        ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
        li: ({ children }) => <li className="markdown-li">{children}</li>,
        blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
        table: ({ children }) => <table className="markdown-table">{children}</table>,
        thead: ({ children }) => <thead className="markdown-thead">{children}</thead>,
        tbody: ({ children }) => <tbody className="markdown-tbody">{children}</tbody>,
        tr: ({ children }) => <tr className="markdown-tr">{children}</tr>,
        th: ({ children }) => <th className="markdown-th">{children}</th>,
        td: ({ children }) => <td className="markdown-td">{children}</td>,
        a: ({ href, children }) => <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer">{children}</a>,
        strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
        em: ({ children }) => <em className="markdown-em">{children}</em>,
    };
    
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
                    <div className="markdown-wrapper">
                        <div className="markdown-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {text}
                            </ReactMarkdown>
                        </div>
                    </div>
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