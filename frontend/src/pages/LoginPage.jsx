import LoginForm from '../components/Auth/LoginForm';
import '../styles/auth.css';

export default function LoginPage() {
	return (
		<div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
			<div className="auth-container col-md-5">
				<div className="auth-header">
					<h2>Inicia Sesión</h2>
					<p className="text-muted">Accede a tu cuenta para continuar</p>
				</div>
				<LoginForm />
				<div className="auth-footer">
					¿No tienes cuenta? <a href="/register" className="auth-link">Regístrate aquí</a>
				</div>
			</div>
		</div>
	);
}