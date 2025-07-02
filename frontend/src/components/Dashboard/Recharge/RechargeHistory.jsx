import { Table } from 'react-bootstrap';
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
            success: { icon: <FaCheckCircle className="me-1" />, className: 'status-badge-success' },
            pending: { icon: <FaClock className="me-1" />, className: 'status-badge-warning' },
            failed: { icon: <FaTimesCircle className="me-1" />, className: 'status-badge-danger' }
        };
        
        const current = variants[statusLower] || variants.pending;
        
        return (
            <span className={`status-badge ${current.className}`}>
                {current.icon}
                <span className="text-capitalize">{statusLower}</span>
            </span>
        );
    };

    return (
        <div className="recharge-history">
            {data.length === 0 ? (
                <div className="no-records text-center">
                    <FaMoneyBillWave size={48} className="no-records-icon" />
                    <h5>No hay recargas registradas</h5>
                    <p className="text-muted mb-0">Aún no has realizado ninguna recarga de créditos.</p>
                </div>
            ) : (
                <Table hover className="history-table">
                    <thead>
                        <tr className="table-header">
                            <th className="text-start">Transacción</th>
                            <th className="text-start">Monto</th>
                            <th className="text-start">Estado</th>
                            <th className="text-start">Fecha</th>
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