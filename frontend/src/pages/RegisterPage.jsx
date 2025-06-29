import { Container } from 'react-bootstrap';
import RegisterForm from '../components/Auth/RegisterForm';
import '../styles/register.css';

const RegisterPage = () => {
	return (
		<div className="register-page">
			<Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
				<div className="register-container p-4 p-md-5">
					<h1 className="text-center mb-4">Crear Cuenta</h1>
					<RegisterForm />
					<div className="text-center mt-4">
						<p>
							¿Ya tienes cuenta?{' '}
							<a href="/login" className="fw-bold">
								Inicia sesión
							</a>
						</p>
					</div>
				</div>
			</Container>
		</div>
	);
};

export default RegisterPage;