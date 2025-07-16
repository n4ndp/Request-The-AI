import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/sidebar.css';
import { FaRegCommentAlt } from 'react-icons/fa';
import { FaPlus, FaPowerOff, FaWandMagicSparkles, FaSun, FaTrash, FaAngleLeft, FaDiamond, FaClockRotateLeft, FaChevronDown, FaUser } from 'react-icons/fa6';
import chatService from '../../services/chatService';
import Swal from 'sweetalert2';
import UserModal from './UserModal';
import RechargeHistoryModal from './Recharge/RechargeHistoryModal';
import AddCreditsModal from './Recharge/AddCreditsModal';

const Sidebar = ({ 
    isOpen, 
    setIsOpen, 
    user, 
    onUserBalanceUpdate, 
    highlightCredits,
    conversations,
    currentConversation,
    onSelectConversation,
    onNewChat,
    loadingConversations,
    onConversationDeleted
}) => {
    const navigate = useNavigate();
    const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRechargeHistoryModal, setShowRechargeHistoryModal] = useState(false);
    const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
    const [currentUserBalance, setCurrentUserBalance] = useState(user?.balance || 0);
    const userPanelRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleUserPanel = () => {
        setIsUserPanelOpen(!isUserPanelOpen);
    };

    const handleEditProfile = () => {
        setShowUserModal(true);
        setIsUserPanelOpen(false);
    };

    const handleViewRechargeHistory = () => {
        setShowRechargeHistoryModal(true);
        setIsUserPanelOpen(false);
    };

    const handleAddCredits = () => {
        setShowAddCreditsModal(true);
    };

    const handleCreditsAdded = (result) => {
        // Actualizar el balance local
        if (result && result.balance !== undefined) {
            setCurrentUserBalance(result.balance);
            // Actualizar el balance en el componente padre
            if (onUserBalanceUpdate) {
                onUserBalanceUpdate(result.balance);
            }
        }
    };

    const handleLogoutClick = () => {
        setIsUserPanelOpen(false);
        handleLogout();
    };

    const handleNewChatClick = () => {
        onNewChat();
    };

    const handleConversationClick = (conversation) => {
        onSelectConversation(conversation);
    };

    const handleDeleteConversation = async (e, conversation) => {
        e.stopPropagation(); // Prevent triggering conversation selection
        
        const result = await Swal.fire({
            title: '¿Eliminar conversación?',
            text: `¿Estás seguro de que quieres eliminar "${conversation.title}"? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            background: '#2a2a2a',
            color: '#ffffff'
        });

        if (result.isConfirmed) {
            try {
                await chatService.deleteConversation(conversation.id);
                
                // If the deleted conversation was the current one, reset to new chat
                if (currentConversation?.id === conversation.id) {
                    onNewChat();
                }
                
                // Notify parent component to refresh conversation list
                if (onConversationDeleted) {
                    onConversationDeleted(conversation.id);
                }

                Swal.fire({
                    title: '¡Eliminada!',
                    text: 'La conversación ha sido eliminada.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#2a2a2a',
                    color: '#ffffff'
                });
            } catch (error) {
                console.error('Error deleting conversation:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar la conversación. Inténtalo de nuevo.',
                    icon: 'error',
                    background: '#2a2a2a',
                    color: '#ffffff'
                });
            }
        }
    };

    // Determinar el tipo de cuenta basado en el balance
    const getAccountType = (balance) => {
        if (balance >= 100) return 'Premium account';
        if (balance >= 50) return 'Plus account';
        return 'Basic account';
    };

    // Información del usuario con valores por defecto
    const userInfo = {
        name: user?.fullName || 'User',
        accountType: getAccountType(currentUserBalance),
    };

    // Información de créditos (asumiendo un límite basado en el tipo de cuenta)
    const getCreditsInfo = (balance, accountType) => {
        let total = 20.0; // Default para Basic
        if (accountType === 'Plus account') total = 50.0;
        if (accountType === 'Premium account') total = 100.0;
        
        return {
            remaining: Number(balance) || 0,
            total: total,
        };
    };

    const credits = getCreditsInfo(currentUserBalance, userInfo.accountType);
    const creditPercentage = Math.min((credits.remaining / credits.total) * 100, 100);

    // Formatear fecha para mostrar en el historial
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Hoy';
        if (diffDays === 2) return 'Ayer';
        if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
        return date.toLocaleDateString();
    };

    // Actualizar balance cuando cambie el prop user
    useEffect(() => {
        setCurrentUserBalance(user?.balance || 0);
    }, [user?.balance]);

    // Cerrar panel cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userPanelRef.current && !userPanelRef.current.contains(event.target)) {
                setIsUserPanelOpen(false);
            }
        };

        if (isUserPanelOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserPanelOpen]);

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <button className="collapse-button" onClick={() => setIsOpen(!isOpen)}>
                <FaAngleLeft style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} />
            </button>
            <div className="sidebar-top">
                <div className="user-profile-container" ref={userPanelRef}>
                    <div 
                        className={`user-profile ${isUserPanelOpen ? 'active' : ''}`}
                        onClick={toggleUserPanel}
                    >
                        <div className="user-avatar"><FaDiamond /></div>
                        {isOpen && (
                            <div className="user-info">
                                <span className="user-name">{userInfo.name}</span>
                                <span className="account-type">{userInfo.accountType}</span>
                            </div>
                        )}
                        {isOpen && (
                            <FaChevronDown 
                                className={`user-panel-toggle ${isUserPanelOpen ? 'rotated' : ''}`}
                            />
                        )}
                    </div>
                    
                    {isOpen && isUserPanelOpen && (
                        <div className="user-options-panel">
                            <button className="user-option" onClick={handleEditProfile}>
                                <FaUser />
                                <span>Editar Perfil</span>
                            </button>
                            <button className="user-option" onClick={handleViewRechargeHistory}>
                                <FaClockRotateLeft />
                                <span>Historial de Recargas</span>
                            </button>
                            <button className="user-option logout-option" onClick={handleLogoutClick}>
                                <FaPowerOff />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="new-chat-section">
                    <button className="new-chat-button" onClick={handleNewChatClick}>
                        <FaPlus /> {isOpen && <span>Start a new chat</span>}
                    </button>
                </div>

                <nav className="chat-history">
                    {loadingConversations && isOpen && (
                        <div className="loading-conversations">
                            <span>Cargando conversaciones...</span>
                        </div>
                    )}
                    
                    {!loadingConversations && conversations.length === 0 && isOpen && (
                        <div className="no-conversations">
                            <span>No hay conversaciones aún</span>
                        </div>
                    )}
                    
                    {!loadingConversations && conversations.map((conversation) => (
                        <div key={conversation.id} className="history-item-container">
                            <button
                                className={`history-item ${currentConversation?.id === conversation.id ? 'active' : ''}`}
                                onClick={() => handleConversationClick(conversation)}
                            >
                                <FaRegCommentAlt />
                                {isOpen && (
                                    <div className="conversation-info">
                                        <span className="conversation-title">{conversation.title}</span>
                                        <span className="conversation-date">{formatDate(conversation.createdAt)}</span>
                                    </div>
                                )}
                            </button>
                            {isOpen && (
                                <button
                                    className="delete-conversation-btn"
                                    onClick={(e) => handleDeleteConversation(e, conversation)}
                                    title="Eliminar conversación"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            <div className="sidebar-middle">
                {isOpen && (
                    <div className="credits-section">
                        <div className="credits-title">
                            <span>Credits Remaining</span>
                        </div>
                        <div className="credits-bar">
                            <div
                                className="credits-bar-fill"
                                style={{ width: `${creditPercentage}%` }}
                            ></div>
                        </div>
                        <div className="credits-amount">
                            <span>${credits.remaining.toFixed(2)} / ${credits.total.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="sidebar-bottom">
                <nav className="sidebar-nav">
                    <button onClick={handleAddCredits} className={`add-credits-button ${highlightCredits ? 'highlight' : ''}`}>
                        <FaWandMagicSparkles /> {isOpen && <span>Add more credits</span>}
                    </button>
                    <a href="#" className="nav-item">
                        <FaSun /> {isOpen && <span>Explore GPTs</span>}
                    </a>
                    <a href="#" className="nav-item">
                        <FaTrash /> {isOpen && <span>Clear all conversations</span>}
                    </a>
                </nav>
            </div>

            {/* Modals */}
            <UserModal 
                show={showUserModal} 
                onHide={() => setShowUserModal(false)} 
            />
            <RechargeHistoryModal 
                show={showRechargeHistoryModal} 
                onHide={() => setShowRechargeHistoryModal(false)} 
            />
            <AddCreditsModal 
                show={showAddCreditsModal} 
                onHide={() => setShowAddCreditsModal(false)}
                onCreditsAdded={handleCreditsAdded}
            />
        </div>
    );
};

export default Sidebar;