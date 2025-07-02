import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatView from './ChatView';
import userService from '../../services/userService';
import '../../styles/chat.css';

const Chat = () => {
    // This will eventually come from a state management solution or props
    const [modelProvider, setModelProvider] = useState('openai'); // 'openai' or 'anthropic'
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
        const loadUserProfile = async () => {
            await fetchUserProfile();
            setLoading(false);
        };

        loadUserProfile();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`chat-container ${modelProvider}-theme`}>
            <Sidebar 
                isOpen={isSidebarOpen} 
                setIsOpen={setSidebarOpen}
                user={user}
                onUserBalanceUpdate={updateUserBalance}
            />
            <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <ChatView 
                    modelProvider={modelProvider} 
                    setModelProvider={setModelProvider} 
                />
            </div>
        </div>
    );
};

export default Chat; 