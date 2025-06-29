import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../components/Dashboard/Sidebar';
import UserModal from '../components/Dashboard/UserModal';
import '../styles/dashboard.css';

const DashboardPage = () => {
    const [activeView, setActiveView] = useState('main');
    const [showUserModal, setShowUserModal] = useState(false);

    const renderContent = () => {
        switch (activeView) {
            case 'main':
                return <div>Panel Principal</div>;
            case 'recharge':
                return <div>Historial de Recargas</div>;
            default:
                return <div>Panel Principal</div>;
        }
    };

    return (
        <div className="dashboard-page">
            <Container fluid className="p-0">
                <Row className="g-0">
                    <Col xs={2} className="sidebar-col">
                        <Sidebar
                            setActiveView={setActiveView}
                            setShowUserModal={setShowUserModal}
                        />
                    </Col>
                    <Col xs={10} className="content-col">
                        {renderContent()}
                    </Col>
                </Row>
            </Container>

            <UserModal
                show={showUserModal}
                onHide={() => setShowUserModal(false)}
            />
        </div>
    );
};

export default DashboardPage;