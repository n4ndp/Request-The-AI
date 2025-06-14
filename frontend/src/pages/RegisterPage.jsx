import RegisterForm from '../components/Auth/RegisterForm';
import '../styles/auth.css';

export default function RegisterPage() {
	return (
		<div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
			<div className="auth-container col-md-5">
				<div className="auth-header">
					<h2>Crea tu cuenta</h2>
					<p className="text-muted">Regístrate para acceder a todas las funcionalidades</p>
				</div>
				<RegisterForm />
				<div className="auth-footer">
					¿Ya tienes cuenta? <a href="/login" className="auth-link">Inicia sesión aquí</a>
				</div>
			</div>
		</div>
	);
}