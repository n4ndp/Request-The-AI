import { Nav } from 'react-bootstrap';
import { FaHome, FaMoneyBillWave, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../styles/sidebar.css';

const Sidebar = ({ setActiveView, setShowUserModal }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>Request The AI</h3>
            </div>

            <Nav className="flex-column navigation-section">
                <Nav.Link 
                    onClick={() => setActiveView('main')} 
                    className="nav-link">
                    <FaHome className="nav-icon" />
                    <span>Panel Principal</span>
                </Nav.Link>
                <Nav.Link 
                    onClick={() => setActiveView('recharge')} 
                    className="nav-link">
                    <FaMoneyBillWave className="nav-icon" />
                    <span>Historial de Recargas</span>
                </Nav.Link>
            </Nav>

            <Nav className="flex-grow-1"></Nav>

            <Nav className="flex-column user-section">
                <Nav.Link 
                    onClick={() => setShowUserModal(true)} 
                    className="nav-link user-link">
                    <FaUserCircle className="nav-icon" />
                    <span>Mi Cuenta</span>
                </Nav.Link>
                <Nav.Link 
                    onClick={handleLogout} 
                    className="nav-link logout-link">
                    <FaSignOutAlt className="nav-icon" />
                    <span>Cerrar Sesión</span>
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default Sidebar;