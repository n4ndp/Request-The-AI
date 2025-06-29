import { useState } from 'react';
import { Form, Button, FloatingLabel, Alert } from 'react-bootstrap';
import { FaSignInAlt } from 'react-icons/fa';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
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

        try {
            const { token, role } = await authService.login({
                username: formData.username,
                password: formData.password
            });
            console.log('Login exitoso. Token:', token, 'Rol:', role);
            // A futuro: redirigir al usuario
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="login-form">
            {error && <Alert variant="danger">{error}</Alert>}

            <FloatingLabel controlId="username" label="Nombre de usuario" className="mb-3">
                <Form.Control
                    type="text"
                    name="username"
                    placeholder="Nombre de usuario"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            </FloatingLabel>

            <FloatingLabel controlId="password" label="Contraseña" className="mb-4">
                <Form.Control
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </FloatingLabel>

            <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-100 py-2 fw-bold"
            >
                {loading ? 'Cargando...' : (
                    <>
                        <FaSignInAlt className="me-2" />
                        Iniciar sesión
                    </>
                )}
            </Button>
        </Form>
    );
};

export default LoginForm;