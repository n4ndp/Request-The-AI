import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatView from './ChatView';
import AddCreditsModal from './Recharge/AddCreditsModal';
import userService from '../../services/userService';
import modelService from '../../services/modelService';
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
            // Models are already being fetched in another useEffect
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

    if (loading && !user) { // Adjusted loading condition
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
            />
            <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <ChatView 
                    models={models}
                    selectedModel={selectedModel}
                    onModelChange={handleModelChange}
                    modelProvider={modelProvider}
                    onInsufficientCredits={handleInsufficientCredits}
                    userBalance={user?.balance || 0}
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