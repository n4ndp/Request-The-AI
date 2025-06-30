import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { FaSyncAlt } from 'react-icons/fa';
import RechargeHistory from './RechargeHistory';
import rechargeService from '../../../services/rechargeServices';
import '../../../styles/recharge.css';

const Recharge = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRechargeHistory = async () => {
        try {
            setLoading(true);
            const data = await rechargeService.getRechargeHistory();
            setHistory(data);
            setError('');
        } catch (err) {
            setError(err.message || 'Error al cargar el historial');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRechargeHistory();
    }, []);

    return (
        <Container fluid className="recharge-container px-4 py-3">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h2 className="mb-0">Historial de Recargas</h2>
                </Col>
                <Col xs="auto">
                    <Button
                        variant="outline-light"
                        onClick={fetchRechargeHistory}
                        disabled={loading}
                    >
                        <FaSyncAlt className={loading ? 'spin' : ''} />
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col>
                    {loading && !history.length ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Cargando historial...</p>
                        </div>
                    ) : error ? (
                        <Alert variant="danger" className="d-flex align-items-center">
                            <div className="flex-grow-1">{error}</div>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={fetchRechargeHistory}
                            >
                                Reintentar
                            </Button>
                        </Alert>
                    ) : (
                        <RechargeHistory data={history} />
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Recharge;