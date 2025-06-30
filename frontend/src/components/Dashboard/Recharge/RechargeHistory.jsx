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
            currency: 'USD'
        }).format(amount);
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'success':
                return <FaCheckCircle className="text-success me-2" />;
            case 'pending':
                return <FaClock className="text-warning me-2" />;
            case 'failed':
                return <FaTimesCircle className="text-danger me-2" />;
            default:
                return null;
        }
    };

    return (
        <div className="recharge-history">
            {data.length === 0 ? (
                <div className="no-records text-center py-5">
                    <FaMoneyBillWave size={48} className="mb-3 text-muted" />
                    <h5 className="text-muted">No hay recargas registradas</h5>
                </div>
            ) : (
                <Table borderless responsive className="history-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th className="text-end">Monto</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((recharge) => (
                            <tr key={recharge.transactionId}>
                                <td className="transaction-id">#{recharge.transactionId}</td>
                                <td className="amount text-end">
                                    {formatCurrency(recharge.amount)}
                                </td>
                                <td>{formatDate(recharge.timestamp)}</td>
                                <td>
                                    <span className={`status-text ${recharge.status.toLowerCase()}`}>
                                        {getStatusIcon(recharge.status)}
                                        {recharge.status}
                                    </span>
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