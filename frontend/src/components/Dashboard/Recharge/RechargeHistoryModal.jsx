import { useState, useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { FaClockRotateLeft, FaXmark } from 'react-icons/fa6';
import rechargeService from '../../../services/rechargeServices';
import RechargeHistory from './RechargeHistory';
import '../../../styles/recharge.css';

const RechargeHistoryModal = ({ show, onHide }) => {
    const [rechargeHistory, setRechargeHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadRechargeHistory = async () => {
            if (!show) return;
            
            setLoading(true);
            setError('');
            
            try {
                const history = await rechargeService.getRechargeHistory();
                // Ordenar por fecha (más reciente primero)
                const sortedHistory = history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setRechargeHistory(sortedHistory);
            } catch (error) {
                console.error('Error al cargar el historial de recargas:', error);
                setError('Error al cargar el historial de recargas');
            } finally {
                setLoading(false);
            }
        };

        loadRechargeHistory();
    }, [show]);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="recharge-history-modal">
            <Modal.Header className="modal-header">
                <Modal.Title className="modal-title">
                    <FaClockRotateLeft className="me-2" />
                    Historial de Recargas
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="modal-body">
                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status" className="mb-3">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                        <p>Cargando historial de recargas...</p>
                    </div>
                ) : (
                    <div className="recharge-history-container">
                        <div className="history-summary mb-4">
                            <p className="text-muted">
                                Total de transacciones: <strong>{rechargeHistory.length}</strong>
                            </p>
                        </div>
                        <RechargeHistory data={rechargeHistory} />
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

export default RechargeHistoryModal; 