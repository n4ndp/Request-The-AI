import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Alert } from 'react-bootstrap';
import { FaUsers, FaUserPlus, FaEdit, FaTrash, FaCubes, FaChartBar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import UserManagement from '../components/Admin/UserManagement';
import ModelManagement from '../components/Admin/ModelManagement';
import UsageManagement from '../components/Admin/UsageManagement';
import '../styles/admin.css';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar que el usuario es administrador
        if (!authService.isAdmin()) {
            navigate('/login');
            return;
        }
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="admin-page">
            <Container fluid className="p-4">
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <h1 className="mb-0">Panel de Administración</h1>
                            <button 
                                className="btn btn-outline-danger"
                                onClick={handleLogout}
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </Col>
                </Row>

                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

                <Row>
                    <Col md={3}>
                        <Card className="admin-sidebar">
                            <Card.Header>
                                <h5 className="mb-0">Herramientas</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Nav variant="pills" className="flex-column">
                                    <Nav.Item>
                                        <Nav.Link 
                                            active={activeTab === 'users'} 
                                            onClick={() => setActiveTab('users')}
                                            className="d-flex align-items-center"
                                        >
                                            <FaUsers className="me-2" />
                                            Gestión de Usuarios
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link 
                                            active={activeTab === 'models'} 
                                            onClick={() => setActiveTab('models')}
                                            className="d-flex align-items-center"
                                        >
                                            <FaCubes className="me-2" />
                                            Gestión de Modelos
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link 
                                            active={activeTab === 'usages'} 
                                            onClick={() => setActiveTab('usages')}
                                            className="d-flex align-items-center"
                                        >
                                            <FaChartBar className="me-2" />
                                            Gestión de Usos
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={9}>
                        <Card className="admin-content">
                            <Card.Body>
                                {activeTab === 'users' && <UserManagement />}
                                {activeTab === 'models' && <ModelManagement />}
                                {activeTab === 'usages' && <UsageManagement />}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminPage; 