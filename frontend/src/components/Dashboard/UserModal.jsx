import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import userService from '../../services/userService';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import '../../styles/usermodal.css';

const UserModal = ({ show, onHide }) => {
    const [userProfile, setUserProfile] = useState({
        fullName: '',
        email: '',
        username: '',
        balance: 0,
        registeredAt: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [updatedProfile, setUpdatedProfile] = useState({
        fullName: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const profile = await userService.getCurrentUserProfile();
                setUserProfile(profile);
                setUpdatedProfile({
                    fullName: profile.fullName,
                    email: profile.email
                });
                setError('');
            } catch (error) {
                console.error('Error al cargar el perfil del usuario:', error);
                setError('Error al cargar el perfil');
            }
        };

        if (show) {
            loadUserProfile();
            setIsEditing(false);
            setSuccess('');
        }
    }, [show]);

    const handleEdit = () => {
        setIsEditing(true);
        setSuccess('');
    };

    const handleSave = async () => {
        try {
            const updatedUser = await userService.updateProfile(updatedProfile);
            setUserProfile(prev => ({
                ...prev,
                fullName: updatedUser.fullName,
                email: updatedUser.email
            }));
            setIsEditing(false);
            setSuccess('Perfil actualizado correctamente');
            setError('');
        } catch (error) {
            console.error('Error al guardar el perfil:', error);
            setError(error.response?.data?.message || 'Error al actualizar el perfil');
            setSuccess('');
        }
    };

    const handleChange = (e) => {
        setUpdatedProfile({
            ...updatedProfile,
            [e.target.name]: e.target.value
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatBalance = (balance) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(balance);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="user-modal">
            <Modal.Header closeButton className="modal-header">
                <Modal.Title className="modal-title">
                    <FaEdit className="me-2" />
                    Mi Cuenta
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="modal-body">
                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                {success && <Alert variant="success" className="mb-4">{success}</Alert>}

                <Form>
                    <Form.Group className="mb-3 form-group">
                        <Form.Label className="form-label">Nombre de Usuario</Form.Label>
                        <Form.Control
                            type="text"
                            value={userProfile.username}
                            readOnly
                            className="form-control"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 form-group">
                        <Form.Label className="form-label">Nombre Completo</Form.Label>
                        <Form.Control
                            type="text"
                            name="fullName"
                            value={isEditing ? updatedProfile.fullName : userProfile.fullName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className="form-control"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 form-group">
                        <Form.Label className="form-label">Correo Electrónico</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={isEditing ? updatedProfile.email : userProfile.email}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className="form-control"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 form-group">
                        <Form.Label className="form-label">Saldo</Form.Label>
                        <Form.Control
                            type="text"
                            value={formatBalance(userProfile.balance)}
                            readOnly
                            className="form-control"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 form-group">
                        <Form.Label className="form-label">Fecha de Registro</Form.Label>
                        <Form.Control
                            type="text"
                            value={formatDate(userProfile.registeredAt)}
                            readOnly
                            className="form-control"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer className="modal-footer">
                {!isEditing ? (
                    <Button variant="warning" onClick={handleEdit} className="edit-btn">
                        <FaEdit className="me-2" />
                        Editar Perfil
                    </Button>
                ) : (
                    <Button variant="success" onClick={handleSave} className="save-btn">
                        <FaSave className="me-2" />
                        Guardar Cambios
                    </Button>
                )}

                <Button variant="secondary" onClick={onHide} className="close-btn">
                    <FaTimes className="me-2" />
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserModal;