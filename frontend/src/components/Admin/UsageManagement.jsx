import { useState, useEffect } from 'react';
import { Table, Alert, Badge, Spinner, Card, Row, Col } from 'react-bootstrap';
import { FaChartBar, FaUsers, FaCoins, FaDollarSign } from 'react-icons/fa';
import usageService from '../../services/usageService';

const UsageManagement = () => {
    const [usages, setUsages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalRealAmount: 0,
        totalPlatformRevenue: 0,
        uniqueUsers: 0
    });

    useEffect(() => {
        loadUsages();
        loadTotalCount();
    }, []);

    const loadUsages = async () => {
        try {
            setLoading(true);
            const usagesData = await usageService.getAllUsagesForAdmin();
            setUsages(usagesData);
            calculateStats(usagesData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadTotalCount = async () => {
        try {
            const count = await usageService.getTotalUsagesCount();
            setTotalCount(count);
        } catch (err) {
            console.error('Error loading total count:', err);
        }
    };

    const calculateStats = (usagesData) => {
        const totalRevenue = usagesData.reduce((sum, usage) => sum + parseFloat(usage.totalAmount || 0), 0);
        const totalRealAmount = usagesData.reduce((sum, usage) => sum + parseFloat(usage.realAmount || 0), 0);
        const totalPlatformRevenue = usagesData.reduce((sum, usage) => sum + parseFloat(usage.platformRevenue || 0), 0);
        const uniqueUsers = new Set(usagesData.map(usage => usage.username)).size;

        setStats({
            totalRevenue,
            totalRealAmount,
            totalPlatformRevenue,
            uniqueUsers
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

    const getStatusBadge = (status) => {
        const variants = {
            SUCCESS: 'success',
            PENDING: 'warning',
            FAILED: 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
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
                <h2>Gestión de Usos</h2>
                <div className="text-muted">
                    Total de registros: <strong>{totalCount}</strong>
                </div>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <FaDollarSign className="mb-2 text-success" size={24} />
                            <h6>Ingresos Totales</h6>
                            <h5 className="text-success">{formatCurrency(stats.totalRevenue)}</h5>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <FaCoins className="mb-2 text-primary" size={24} />
                            <h6>Costo Real</h6>
                            <h5 className="text-primary">{formatCurrency(stats.totalRealAmount)}</h5>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <FaChartBar className="mb-2 text-warning" size={24} />
                            <h6>Ganancia Plataforma</h6>
                            <h5 className="text-warning">{formatCurrency(stats.totalPlatformRevenue)}</h5>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <FaUsers className="mb-2 text-info" size={24} />
                            <h6>Usuarios Únicos</h6>
                            <h5 className="text-info">{stats.uniqueUsers}</h5>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Usage Table */}
            <Card>
                <Card.Header>
                    <h5 className="mb-0">Historial de Usos</h5>
                </Card.Header>
                <Card.Body>
                    {usages.length === 0 ? (
                        <div className="text-center p-4">
                            <p className="text-muted">No hay registros de uso disponibles.</p>
                        </div>
                    ) : (
                        <Table responsive striped hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Usuario</th>
                                    <th>Modelo</th>
                                    <th>Tokens</th>
                                    <th>Costo Real</th>
                                    <th>Ganancia</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usages.map((usage) => (
                                    <tr key={usage.id}>
                                        <td>#{usage.id}</td>
                                        <td>
                                            <strong>{usage.username}</strong>
                                        </td>
                                        <td>
                                            <Badge bg="secondary" className="me-1">
                                                {usage.modelName}
                                            </Badge>
                                        </td>
                                        <td>{usage.tokens?.toLocaleString()}</td>
                                        <td className="text-primary">
                                            {formatCurrency(usage.realAmount)}
                                        </td>
                                        <td className="text-warning">
                                            {formatCurrency(usage.platformRevenue)}
                                        </td>
                                        <td className="text-success fw-bold">
                                            {formatCurrency(usage.totalAmount)}
                                        </td>
                                        <td>{getStatusBadge(usage.status)}</td>
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

export default UsageManagement; 