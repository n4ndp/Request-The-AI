import { useState } from 'react';
import { FaUser, FaLock, FaEnvelope, FaIdCard } from 'react-icons/fa';
import { authService } from '../../services/authService';

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Datos de registro:', formData);
        try {
            const { token, role } = await authService.register(formData);
            console.log('Registro exitoso. Token:', token, 'Rol:', role);
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

        <div className="mb-3 input-group">
            <span className="input-group-text">
            <FaIdCard />
            </span>
            <input
            type="text"
            className="form-control"
            placeholder="Nombre completo"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            />
        </div>

        <div className="mb-3 input-group">
            <span className="input-group-text">
            <FaEnvelope />
            </span>
            <input
            type="email"
            className="form-control"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

        <button type="submit" className="btn btn-success w-100 py-2">
            Registrarse
        </button>
        </form>
    );
}