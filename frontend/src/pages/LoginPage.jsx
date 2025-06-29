import { Container } from 'react-bootstrap';
import LoginForm from '../components/Auth/LoginForm';
import '../styles/login.css';

const LoginPage = () => {
	return (
		<div className="login-page">
			<Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
				<div className="login-container p-4 p-md-5">
					<h1 className="text-center mb-4">Request The AI</h1>
					<LoginForm />
					<div className="text-center mt-4">
						<p>
							¿No tienes cuenta?{' '}
							<a href="/register" className="fw-bold">
								Regístrate
							</a>
						</p>
					</div>
				</div>
			</Container>
		</div>
	);
};

export default LoginPage;