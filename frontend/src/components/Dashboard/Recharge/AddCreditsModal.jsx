import { useState } from 'react';
import { Modal, Button, Form, Alert, InputGroup } from 'react-bootstrap';
import { FaCreditCard, FaXmark, FaDollarSign } from 'react-icons/fa6';
import rechargeService from '../../../services/rechargeServices';
import '../../../styles/recharge.css';

const AddCreditsModal = ({ show, onHide, onCreditsAdded, modelProvider }) => {
    const [amount, setAmount] = useState('10');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAmountChange = (e) => {
        const value = e.target.value;
        // Solo permitir números y punto decimal
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
            setError('');
        }
    };

    const handleConfirm = async () => {
        const numericAmount = parseFloat(amount);
        
        // Validaciones
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Por favor ingresa un monto válido');
            return;
        }

        if (numericAmount < 1) {
            setError('El monto mínimo es $1');
            return;
        }

        if (numericAmount > 1000) {
            setError('El monto máximo es $1000');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await rechargeService.rechargeBalance(numericAmount);
            setSuccess(`Se agregaron $${numericAmount.toFixed(2)} a tu balance exitosamente`);
            
            // Notificar al componente padre que se agregaron créditos
            if (onCreditsAdded) {
                onCreditsAdded(result);
            }

            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                handleClose();
            }, 2000);

        } catch (error) {
            console.error('Error al agregar créditos:', error);
            setError(error.message || 'Error al procesar la recarga');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setAmount('10');
        setError('');
        setSuccess('');
        setLoading(false);
        onHide();
    };

    const formatDisplayAmount = () => {
        const numericAmount = parseFloat(amount);
        return isNaN(numericAmount) ? '0.00' : numericAmount.toFixed(2);
    };

    return (
        <Modal show={show} onHide={handleClose} size="md" centered className={`add-credits-modal ${modelProvider}-theme`}>
            <Modal.Header className="modal-header">
                <Modal.Title className="modal-title">
                    <FaCreditCard className="me-2" />
                    Add to credit balance
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="modal-body">
                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                {success && <Alert variant="success" className="mb-4">{success}</Alert>}

                <Form>
                    <Form.Group className="mb-4">
                        <Form.Label className="form-label">Amount to add</Form.Label>
                        <InputGroup className="amount-input-group">
                            <InputGroup.Text className="input-group-text">
                                <FaDollarSign />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="10.00"
                                className="amount-input"
                                disabled={loading}
                            />
                        </InputGroup>
                        <Form.Text className="form-text">
                            Enter an amount greater than or equal to $1
                        </Form.Text>
                    </Form.Group>

                    <div className="payment-method-section">
                        <Form.Label className="form-label">Payment method</Form.Label>
                        <div className="payment-method-display">
                            <div className="visa-card">
                                <div className="visa-logo">VISA</div>
                                <div className="card-number">•••• 6620</div>
                            </div>
                        </div>
                        <div className="payment-note">
                            <small className="text-muted">
                                * Sistema de pago en desarrollo - Por ahora los créditos se agregarán directamente para testing
                            </small>
                        </div>
                    </div>
                </Form>
            </Modal.Body>

            <Modal.Footer className="modal-footer">
                <Button 
                    variant="secondary" 
                    onClick={handleClose} 
                    disabled={loading}
                    className="cancel-btn"
                >
                    Cancel
                </Button>
                <Button 
                    variant="success" 
                    onClick={handleConfirm} 
                    disabled={loading || !amount}
                    className="confirm-btn"
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                        </>
                    ) : (
                        `Confirm - $${formatDisplayAmount()}`
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddCreditsModal; 