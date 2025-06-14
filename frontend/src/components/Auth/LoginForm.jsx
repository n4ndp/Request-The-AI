import { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { authService } from '../../services/authService';

export default function LoginForm() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Datos de login:', formData);
        try {
            const { token, role } = await authService.login({
                username: formData.username,
                password: formData.password
            });
            console.log('Login exitoso. Token:', token, 'Rol:', role);
            // A futuro: almacenar el token y redirigir al usuario
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
        <div className="mb-3 input-group">
            <span className="input-group-text">
            <FaUser />
            </span>
            <input
            type="text"
            className="form-control"
            placeholder="Usuario"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            />
        </div>

        <div className="mb-4 input-group">
            <span className="input-group-text">
            <FaLock />
            </span>
            <input
            type="password"
            className="form-control"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            />
        </div>

        <button type="submit" className="btn btn-primary w-100 py-2 mb-3">
            Iniciar Sesión
        </button>

        <div className="text-end">
            <a href="#" className="text-decoration-none small text-muted">
            ¿Olvidaste tu contraseña?
            </a>
        </div>
        </form>
    );
}