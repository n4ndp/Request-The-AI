import { useState, useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { FaChartBar, FaXmark } from 'react-icons/fa6';
import usageService from '../../../services/usageService';
import UsageHistory from './UsageHistory';
import '../../../styles/recharge.css';

const UsageHistoryModal = ({ show, onHide }) => {
    const [usageHistory, setUsageHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadUsageHistory = async () => {
            if (!show) return;
            
            setLoading(true);
            setError('');
            
            try {
                const history = await usageService.getMyUsages();
                // Ordenar por fecha (más reciente primero)
                const sortedHistory = history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setUsageHistory(sortedHistory);
            } catch (error) {
                console.error('Error al cargar el historial de uso:', error);
                setError('Error al cargar el historial de uso');
            } finally {
                setLoading(false);
            }
        };

        loadUsageHistory();
    }, [show]);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="recharge-history-modal">
            <Modal.Header className="modal-header">
                <Modal.Title className="modal-title">
                    <FaChartBar className="me-2" />
                    Historial de Uso
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="modal-body">
                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status" className="mb-3">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                        <p>Cargando historial de uso...</p>
                    </div>
                ) : (
                    <div className="recharge-history-container">
                        <div className="history-summary mb-4">
                            <p className="text-muted">
                                Total de transacciones: <strong>{usageHistory.length}</strong>
                            </p>
                        </div>
                        <UsageHistory data={usageHistory} />
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="modal-footer">
                <Button variant="secondary" onClick={onHide} className="close-btn">
                    <FaXmark className="me-2" />
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UsageHistoryModal; 