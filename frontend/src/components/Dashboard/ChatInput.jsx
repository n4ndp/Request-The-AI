import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaImage, FaTimes } from 'react-icons/fa';

const ChatInput = ({ onSendMessage, modelProvider, selectedModel }) => {
    const [message, setMessage] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const fileInputRef = useRef(null);

    // Verifica si el modelo actual soporta imágenes
    const supportsImages = () => {
        const visionModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-vision-preview'];
        const modelName = selectedModel?.name?.toLowerCase() || '';
        
        return visionModels.some(model => modelName.includes(model.toLowerCase()));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() || selectedImages.length > 0) {
            if (selectedImages.length > 0) {
                // Crear contenido multimodal
                const multimodalContent = [];
                
                // Agregar texto si existe
                if (message.trim()) {
                    multimodalContent.push({
                        type: 'text',
                        text: message.trim()
                    });
                }
                
                // Agregar imágenes
                selectedImages.forEach(image => {
                    multimodalContent.push({
                        type: 'image_url',
                        imageUrl: {
                            url: image.dataUrl,
                            detail: 'auto'
                        }
                    });
                });
                
                onSendMessage(null, multimodalContent);
            } else {
                // Enviar solo texto
                onSendMessage(message);
            }
            
            setMessage('');
            setSelectedImages([]);
        }
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const newImage = {
                        id: Date.now() + Math.random(),
                        file: file,
                        dataUrl: event.target.result,
                        name: file.name
                    };
                    
                    setSelectedImages(prev => [...prev, newImage]);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Limpiar el input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (imageId) => {
        setSelectedImages(prev => prev.filter(img => img.id !== imageId));
    };

    return (
        <div className="chat-input-area">
            {/* Vista previa de imágenes seleccionadas */}
            {selectedImages.length > 0 && (
                <div className="image-preview-container">
                    {selectedImages.map(image => (
                        <div key={image.id} className="image-preview-item">
                            <img 
                                src={image.dataUrl} 
                                alt={image.name}
                                className="preview-image"
                            />
                            <button 
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="remove-image-btn"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={selectedImages.length > 0 ? 
                        "Describe what you'd like to know about the image(s)..." : 
                        "Example: 'Explain quantum computing in simple terms'"
                    }
                    className="chat-input"
                />
                
                {/* Botón para seleccionar imágenes (solo visible si el modelo lo soporta) */}
                {supportsImages() && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                        />
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="image-select-button"
                        >
                            <FaImage />
                        </button>
                    </>
                )}
                
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