import { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { FaTriangleExclamation, FaCreditCard, FaXmark } from 'react-icons/fa6';
import '../../styles/recharge.css';

const InsufficientCreditsModal = ({ show, onHide, userBalance, onAddCredits }) => {
    const isNoCredits = userBalance <= 0;
    const isLowCredits = userBalance > 0 && userBalance < 1;

    const getModalConfig = () => {
        if (isNoCredits) {
            return {
                title: 'Sin créditos disponibles',
                message: 'No tienes créditos para enviar mensajes. Necesitas agregar créditos para continuar usando la plataforma.',
                icon: <FaTriangleExclamation style={{ color: '#ef4444', fontSize: '3rem' }} />,
                buttonText: 'Agregar créditos ahora',
                buttonVariant: 'danger'
            };
        } else if (isLowCredits) {
            return {
                title: 'Créditos insuficientes',
                message: `Solo tienes $${userBalance.toFixed(2)} en créditos, lo cual no es suficiente para enviar este mensaje. Te recomendamos recargar para continuar.`,
                icon: <FaTriangleExclamation style={{ color: '#f59e0b', fontSize: '3rem' }} />,
                buttonText: 'Recargar créditos',
                buttonVariant: 'warning'
            };
        }
    };

    const config = getModalConfig();
    
    if (!config) return null;

    const handleAddCredits = () => {
        onHide();
        if (onAddCredits) {
            onAddCredits();
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="md" centered className="add-credits-modal">
            <Modal.Header className="modal-header">
                <Modal.Title className="modal-title">
                    <FaTriangleExclamation className="me-2" style={{ color: config.buttonVariant === 'danger' ? '#ef4444' : '#f59e0b' }} />
                    {config.title}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="modal-body text-center">
                <div className="mb-4">
                    {config.icon}
                </div>
                
                <Alert variant={config.buttonVariant === 'danger' ? 'danger' : 'warning'} className="mb-4">
                    {config.message}
                </Alert>

                <div className="current-balance-display">
                    <h5 className="mb-1">Balance actual:</h5>
                    <h3 className="text-muted">${userBalance.toFixed(2)}</h3>
                </div>
            </Modal.Body>

            <Modal.Footer className="modal-footer">
                <Button 
                    variant="secondary" 
                    onClick={onHide}
                    className="cancel-btn"
                >
                    Cancelar
                </Button>
                <Button 
                    variant={config.buttonVariant}
                    onClick={handleAddCredits}
                    className="confirm-btn"
                >
                    <FaCreditCard className="me-2" />
                    {config.buttonText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InsufficientCreditsModal; 