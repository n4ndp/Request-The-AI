import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import RechargeHistory from './RechargeHistory';
import rechargeService from '../../../services/rechargeServices';
import '../../../styles/recharge.css';

const Recharge = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRechargeHistory = async () => {
            try {
                const data = await rechargeService.getRechargeHistory();
                setHistory(data);
                setError('');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRechargeHistory();
    }, []);

    return (
        <Container fluid className="recharge-container">
            <Row>
                <Col>
                    <h2 className="mb-4">Historial de Recargas</h2>

                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" variant="primary" />
                            <p>Cargando historial...</p>
                        </div>
                    ) : error ? (
                        <Alert variant="danger">
                            {error}
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
