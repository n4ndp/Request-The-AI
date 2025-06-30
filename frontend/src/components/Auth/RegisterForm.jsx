import { useState } from 'react';
import { Form, Button, FloatingLabel, Alert } from 'react-bootstrap';
import { FaUserPlus } from 'react-icons/fa';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...userData } = formData;
            const { token, role } = await authService.register(userData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="register-form">
            {error && <Alert variant="danger">{error}</Alert>}

            <FloatingLabel controlId="username" label="Nombre de usuario" className="mb-3">
                <Form.Control
                    type="text"
                    name="username"
                    placeholder="Nombre de usuario"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                />
            </FloatingLabel>

            <FloatingLabel controlId="email" label="Correo electrónico" className="mb-3">
                <Form.Control
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </FloatingLabel>

            <FloatingLabel controlId="fullName" label="Nombre completo" className="mb-3">
                <Form.Control
                    type="text"
                    name="fullName"
                    placeholder="Nombre completo"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />
            </FloatingLabel>

            <FloatingLabel controlId="password" label="Contraseña" className="mb-3">
                <Form.Control
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                />
            </FloatingLabel>

            <FloatingLabel controlId="confirmPassword" label="Confirmar contraseña" className="mb-4">
                <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                />
            </FloatingLabel>

            <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-100 py-2 fw-bold"
            >
                {loading ? 'Registrando...' : (
                    <>
                        <FaUserPlus className="me-2" />
                        Registrarse
                    </>
                )}
            </Button>
        </Form>
    );
};

export default RegisterForm;