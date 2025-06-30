import { Table, Badge } from 'react-bootstrap';
import { FaMoneyBillWave, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const RechargeHistory = ({ data }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusLower = status.toLowerCase();
        const variants = {
            success: { icon: <FaCheckCircle className="me-1" />, bg: 'success-light', text: 'success' },
            pending: { icon: <FaClock className="me-1" />, bg: 'warning-light', text: 'warning' },
            failed: { icon: <FaTimesCircle className="me-1" />, bg: 'danger-light', text: 'danger' }
        };
        
        const current = variants[statusLower];
        
        return (
            <Badge bg={current.bg} text={current.text} className="d-flex align-items-center py-2">
                {current.icon}
                <span className="text-capitalize">{statusLower}</span>
            </Badge>
        );
    };

    return (
        <div className="recharge-history">
            {data.length === 0 ? (
                <div className="no-records text-center py-5">
                    <FaMoneyBillWave size={48} className="mb-3 no-records-icon" />
                    <h5>No hay recargas registradas</h5>
                </div>
            ) : (
                <Table hover className="history-table">
                    <thead>
                        <tr className="table-header">
                            <th className="text-start">Transacción</th>
                            <th className="text-start">Monto</th>
                            <th className="text-start">Fecha</th>
                            <th className="text-start">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((recharge) => (
                            <tr key={recharge.transactionId} className="table-row">
                                <td className="col-2 text-start transaction-id">
                                    #{recharge.transactionId}
                                </td>
                                <td className="col-2 text-start amount">
                                    {formatCurrency(recharge.amount)}
                                </td>
                                <td className="col-2 text-start status">
                                    {getStatusBadge(recharge.status)}
                                </td>
                                <td className="col-4 text-start timestamp">
                                    {formatDate(recharge.timestamp)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default RechargeHistory;