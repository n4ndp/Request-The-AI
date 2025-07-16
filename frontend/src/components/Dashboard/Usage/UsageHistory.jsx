import { useState, useEffect } from 'react';
import { Table, Alert, Badge, Spinner, Card, Row, Col } from 'react-bootstrap';
import { FaCoins, FaRobot, FaCalendarAlt } from 'react-icons/fa';
import usageService from '../../../services/usageService';
import '../../../styles/recharge.css';

const UsageHistory = () => {
    const [usages, setUsages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalSpent: 0,
        totalTokens: 0,
        transactionCount: 0
    });

    useEffect(() => {
        loadMyUsages();
    }, []);

    const loadMyUsages = async () => {
        try {
            setLoading(true);
            const usagesData = await usageService.getMyUsages();
            setUsages(usagesData);
            calculateStats(usagesData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (usagesData) => {
        const totalSpent = usagesData.reduce((sum, usage) => sum + parseFloat(usage.totalAmount || 0), 0);
        const totalTokens = usagesData.reduce((sum, usage) => sum + parseInt(usage.tokens || 0), 0);
        const transactionCount = usagesData.length;

        setStats({
            totalSpent,
            totalTokens,
            transactionCount
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 8
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES');
    };

    if (loading) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Mi Historial de Uso</h3>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <FaCoins className="mb-2 text-primary" size={24} />
                            <h6>Total Gastado</h6>
                            <h5 className="text-primary">{formatCurrency(stats.totalSpent)}</h5>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <FaRobot className="mb-2 text-success" size={24} />
                            <h6>Tokens Usados</h6>
                            <h5 className="text-success">{stats.totalTokens.toLocaleString()}</h5>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <FaCalendarAlt className="mb-2 text-info" size={24} />
                            <h6>Transacciones</h6>
                            <h5 className="text-info">{stats.transactionCount}</h5>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Usage Table */}
            <Card>
                <Card.Header>
                    <h5 className="mb-0">Historial de Transacciones</h5>
                </Card.Header>
                <Card.Body>
                    {usages.length === 0 ? (
                        <div className="text-center p-4">
                            <p className="text-muted">Aún no tienes transacciones registradas.</p>
                            <p className="text-muted">Comienza a usar nuestros modelos de IA para ver tu historial aquí.</p>
                        </div>
                    ) : (
                        <Table responsive striped hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Modelo</th>
                                    <th>Tokens</th>
                                    <th>Costo</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usages.map((usage) => (
                                    <tr key={usage.id}>
                                        <td>#{usage.id}</td>
                                        <td>
                                            <Badge bg="secondary">
                                                {usage.modelName}
                                            </Badge>
                                        </td>
                                        <td>{usage.tokens?.toLocaleString()}</td>
                                        <td className="text-primary fw-bold">
                                            {formatCurrency(usage.totalAmount)}
                                        </td>
                                        <td>{formatDate(usage.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default UsageHistory; 