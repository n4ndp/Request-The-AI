import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatView from './ChatView';
import AddCreditsModal from './Recharge/AddCreditsModal';
import userService from '../../services/userService';
import modelService from '../../services/modelService';
import chatService from '../../services/chatService';
import '../../styles/chat.css';

const Chat = () => {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [modelProvider, setModelProvider] = useState('openai');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [highlightCredits, setHighlightCredits] = useState(false);
    const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
    
    // Estados para las conversaciones
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [conversationMessages, setConversationMessages] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const fetchedModels = await modelService.getModels();
                setModels(fetchedModels);
                if (fetchedModels.length > 0) {
                    // Set default model
                    const defaultModel = fetchedModels.find(m => m.provider.toLowerCase() === 'openai') || fetchedModels[0];
                    setSelectedModel(defaultModel);
                    setModelProvider(defaultModel.provider.toLowerCase());
                }
            } catch (error) {
                console.error('Error fetching models:', error);
            }
        };

        fetchModels();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const userProfile = await userService.getCurrentUserProfile();
            setUser(userProfile);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Si hay error, usar datos por defecto
            setUser({
                firstName: 'User',
                lastName: '',
                email: 'user@example.com',
                role: 'USER'
            });
        }
    };

    const fetchConversations = async () => {
        try {
            setLoadingConversations(true);
            const userConversations = await chatService.getUserConversations();
            setConversations(userConversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const updateUserBalance = (newBalance) => {
        setUser(prevUser => ({
            ...prevUser,
            balance: newBalance
        }));
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await fetchUserProfile();
            await fetchConversations();
            setLoading(false);
        };

        loadInitialData();
    }, []);
    
    const handleModelChange = (model) => {
        setSelectedModel(model);
        setModelProvider(model.provider.toLowerCase());
    }

    const handleInsufficientCredits = () => {
        setHighlightCredits(true);
        setShowAddCreditsModal(true);
        setTimeout(() => {
            setHighlightCredits(false);
        }, 3000);
    };

    const handleCreditsAdded = (result) => {
        // Actualizar el balance del usuario
        if (result && result.balance !== undefined) {
            updateUserBalance(result.balance);
        }
        setShowAddCreditsModal(false);
    };

    const handleCloseAddCreditsModal = () => {
        setShowAddCreditsModal(false);
    };

    // Función para iniciar un nuevo chat
    const handleNewChat = () => {
        setCurrentConversation(null);
        setConversationMessages([]);
    };

    // Función para seleccionar una conversación
    const handleSelectConversation = async (conversation) => {
        try {
            setCurrentConversation(conversation);
            const conversationDetail = await chatService.getConversationDetail(conversation.id);
            
            // Convertir los mensajes del backend al formato esperado por el frontend
            const formattedMessages = conversationDetail.messages.map(msg => ({
                text: msg.content,
                sender: msg.messageType === 'USER' ? 'user' : 'ai',
                provider: modelProvider,
                conversationId: conversationDetail.id,
                openAiMessageId: msg.openAiMessageId,
                isStreaming: false
            }));
            
            setConversationMessages(formattedMessages);
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    // Función para manejar la eliminación de conversaciones
    const handleConversationDeleted = async (deletedConversationId) => {
        // Recargar la lista de conversaciones
        await fetchConversations();
        
        // Si la conversación eliminada era la activa, limpiar el estado
        if (currentConversation?.id === deletedConversationId) {
            setCurrentConversation(null);
            setConversationMessages([]);
        }
    };

    // Función para manejar cuando se envía un mensaje en una nueva conversación
    const handleConversationCreated = (newConversation) => {
        // Refrescar la lista de conversaciones para mostrar la nueva en el sidebar
        fetchConversations();
        
        // Actualizar currentConversation después de un pequeño delay para no interrumpir el flujo del chat
        setTimeout(() => {
            if (!currentConversation) {
                setCurrentConversation(newConversation);
            }
        }, 500);
    };

    if (loading && !user) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`chat-container ${modelProvider}-theme`}>
            <Sidebar 
                isOpen={isSidebarOpen} 
                setIsOpen={setSidebarOpen} 
                user={user}
                onUserBalanceUpdate={updateUserBalance}
                highlightCredits={highlightCredits}
                conversations={conversations}
                currentConversation={currentConversation}
                onSelectConversation={handleSelectConversation}
                onNewChat={handleNewChat}
                loadingConversations={loadingConversations}
                onConversationDeleted={handleConversationDeleted}
            />
            <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <ChatView 
                    models={models}
                    selectedModel={selectedModel}
                    onModelChange={handleModelChange}
                    modelProvider={modelProvider}
                    onInsufficientCredits={handleInsufficientCredits}
                    userBalance={user?.balance || 0}
                    onBalanceChange={updateUserBalance}
                    currentConversation={currentConversation}
                    initialMessages={conversationMessages}
                    onConversationCreated={handleConversationCreated}
                />
            </div>
            
            <AddCreditsModal 
                show={showAddCreditsModal} 
                onHide={handleCloseAddCreditsModal}
                onCreditsAdded={handleCreditsAdded}
            />
        </div>
    );
};

export default Chat; 