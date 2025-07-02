import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/sidebar.css';
import { FaRegCommentAlt } from 'react-icons/fa';
import { FaPlus, FaPowerOff, FaWandMagicSparkles, FaSun, FaTrash, FaAngleLeft, FaDiamond } from 'react-icons/fa6';

const Sidebar = ({ isOpen, setIsOpen, user }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Determinar el tipo de cuenta basado en el balance
    const getAccountType = (balance) => {
        if (balance >= 100) return 'Premium account';
        if (balance >= 50) return 'Plus account';
        return 'Basic account';
    };

    // Información del usuario con valores por defecto
    const userBalance = user?.balance || 0;
    const userInfo = {
        name: user?.fullName || 'User',
        accountType: getAccountType(userBalance),
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

    const credits = getCreditsInfo(userBalance, userInfo.accountType);
    const creditPercentage = Math.min((credits.remaining / credits.total) * 100, 100);
    const chatHistory = [
        'How to write an impacting...',
        'Web accessibility',
        'Design inspiration'
    ];

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <button className="collapse-button" onClick={() => setIsOpen(!isOpen)}>
                <FaAngleLeft style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} />
            </button>
            <div className="sidebar-top">
                <div className="user-profile">
                    <div className="user-avatar"><FaDiamond /></div>
                    {isOpen && (
                        <div className="user-info">
                            <span className="user-name">{userInfo.name}</span>
                            <span className="account-type">{userInfo.accountType}</span>
                        </div>
                    )}
                </div>

                <div className="new-chat-section">
                    <button className="new-chat-button">
                        <FaPlus /> {isOpen && <span>Start a new chat</span>}
                    </button>
                </div>

                <nav className="chat-history">
                    {chatHistory.map((chat, index) => (
                        <a href="#" key={index} className="history-item">
                            <FaRegCommentAlt />
                            {isOpen && <span>{chat}</span>}
                        </a>
                    ))}
                </nav>
            </div>

            <div className="sidebar-middle">
                {isOpen && (
                    <div className="credits-section">
                        <div className="credits-info">
                            <span>Credits Remaining</span>
                            <span>${credits.remaining.toFixed(2)} / ${credits.total.toFixed(2)}</span>
                        </div>
                        <div className="credits-bar">
                            <div
                                className="credits-bar-fill"
                                style={{ width: `${creditPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="sidebar-bottom">
                <nav className="sidebar-nav">
                    <a href="#" className="nav-item">
                        <FaWandMagicSparkles /> {isOpen && <span>Add more credits</span>}
                    </a>
                    <a href="#" className="nav-item">
                        <FaSun /> {isOpen && <span>Explore GPTs</span>}
                    </a>
                    <a href="#" className="nav-item">
                        <FaTrash /> {isOpen && <span>Clear all conversations</span>}
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-button">
                        <FaPowerOff /> {isOpen && <span>Log out</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;