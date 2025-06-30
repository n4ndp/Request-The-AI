import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../components/Dashboard/Sidebar';
import UserModal from '../components/Dashboard/UserModal';
import Recharge from '../components/Dashboard/Recharge/Recharge';
import '../styles/dashboard.css';

const DashboardPage = () => {
    const [activeView, setActiveView] = useState('main');
    const [showUserModal, setShowUserModal] = useState(false);

    const renderContent = () => {
        switch (activeView) {
            case 'main':
                return <div>Panel Principal</div>;
            case 'recharge':
                return <Recharge />;
            default:
                return <div>Panel Principal</div>;
        }
    };

    return (
        <div className="dashboard-page">
            <Container fluid className="p-0">
                <Row className="g-0">
                    <Col className="sidebar-col">
                        <Sidebar
                            setActiveView={setActiveView}
                            setShowUserModal={setShowUserModal}
                        />
                    </Col>
                    <Col className="content-col">
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