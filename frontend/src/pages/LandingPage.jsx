import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/register');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    useEffect(() => {
        // Navbar scroll effect
        const handleScroll = () => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('shadow-sm');
                } else {
                    navbar.classList.remove('shadow-sm');
                }
            }
        };

        // Smooth scrolling for anchor links
        const handleAnchorClick = (e) => {
            const href = e.target.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        };

        // Fade in animation observer
        const fadeElements = document.querySelectorAll('.fade-in');
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        // Initialize fade elements
        fadeElements.forEach(el => {
            el.style.opacity = 0;
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            fadeInObserver.observe(el);
        });

        // Add event listeners
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleAnchorClick);

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleAnchorClick);
            fadeElements.forEach(el => {
                fadeInObserver.unobserve(el);
            });
        };
    }, []);

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
                <div className="container">
                    <a className="navbar-brand" href="#" onClick={(e) => e.preventDefault()}>
                        <i className="fas fa-robot me-2"></i>RequestTheAI
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link" href="#features">Características</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#models">Modelos</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#contact">Contacto</a>
                            </li>
                        </ul>
                        <div className="ms-lg-3 mt-3 mt-lg-0">
                            <button onClick={handleLogin} className="btn btn-outline-light me-2">Iniciar Sesión</button>
                            <button onClick={handleGetStarted} className="btn btn-primary">Comenzar a Usar</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container hero-content">
                    <div className="row align-items-center">
                        <div className="col-lg-6 fade-in">
                            <h1 className="hero-title">Potencia tu productividad con IA de pago por uso</h1>
                            <p className="hero-subtitle">Accede a los modelos más avanzados de inteligencia artificial con nuestro sistema de créditos prepago. Paga solo por lo que uses, sin compromisos ni sorpresas.</p>
                            <div className="d-flex flex-wrap gap-3">
                                <button onClick={handleGetStarted} className="btn btn-primary">Comenzar a Usar</button>
                                <a href="#features" className="btn btn-outline-light">Saber Más</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-5" style={{backgroundColor: 'var(--darker)'}}>
                <div className="container py-5">
                    <div className="text-center mb-5 fade-in">
                        <h2 className="section-title fw-bold d-inline-block">Por qué elegir RequestTheAI</h2>
                        <p className="text-white-50">Descubre las ventajas de nuestra plataforma de IA prepago</p>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-4 fade-in" style={{animationDelay: '0.1s'}}>
                            <div className="feature-card card">
                                <div className="card-body p-4 text-center">
                                    <div className="feature-icon">
                                        <i className="fas fa-bolt"></i>
                                    </div>
                                    <h3 className="feature-title">Rendimiento Excepcional</h3>
                                    <p className="feature-text">Experimenta velocidades de respuesta inigualables con nuestra infraestructura optimizada para IA, diseñada para ofrecer resultados en tiempo real.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 fade-in" style={{animationDelay: '0.2s'}}>
                            <div className="feature-card card">
                                <div className="card-body p-4 text-center">
                                    <div className="feature-icon">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                    <h3 className="feature-title">Control Total de Costos</h3>
                                    <p className="feature-text">Mantén el control absoluto de tu inversión en IA. Compra créditos según tus necesidades y úsalos a tu ritmo, sin cargos ocultos ni suscripciones forzosas.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 fade-in" style={{animationDelay: '0.3s'}}>
                            <div className="feature-card card">
                                <div className="card-body p-4 text-center">
                                    <div className="feature-icon">
                                        <i className="fas fa-lock"></i>
                                    </div>
                                    <h3 className="feature-title">Seguridad de Datos</h3>
                                    <p className="feature-text">Implementamos los más altos estándares de seguridad y privacidad. Tus interacciones con la IA son confidenciales y nunca se utilizan para entrenar modelos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Models Section */}
            <section id="models" className="py-5">
                <div className="container py-5">
                    <div className="text-center mb-5 fade-in">
                        <h2 className="section-title fw-bold d-inline-block">Modelos Disponibles</h2>
                        <p className="text-white-50">Selecciona el modelo que mejor se adapte a tus necesidades</p>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-3 fade-in" style={{animationDelay: '0.1s'}}>
                            <div className="model-card card">
                                <div className="card-body p-4">
                                    <span className="badge model-badge mb-2">OpenAI</span>
                                    <h3 className="model-title">GPT-4o</h3>
                                    <p className="small text-white-50 mb-3">El modelo más avanzado para tareas complejas que requieren comprensión profunda.</p>
                                    
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-blue">
                                            <i className="fas fa-eye"></i>
                                        </div>
                                        <span>Multimodal</span>
                                    </div>
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-green">
                                            <i className="fas fa-brain"></i>
                                        </div>
                                        <span>128k contexto</span>
                                    </div>
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-purple">
                                            <i className="fas fa-lightbulb"></i>
                                        </div>
                                        <span>Razonamiento avanzado</span>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <small className="text-muted">Desde</small>
                                        <div className="model-price">$0.003 / 1K tokens</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 fade-in" style={{animationDelay: '0.2s'}}>
                            <div className="model-card card">
                                <div className="card-body p-4">
                                    <span className="badge model-badge mb-2">OpenAI</span>
                                    <h3 className="model-title">GPT-4 Turbo</h3>
                                    <p className="small text-white-50 mb-3">Equilibrio perfecto entre rendimiento y costo para aplicaciones profesionales.</p>
                                    
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-blue">
                                            <i className="fas fa-book"></i>
                                        </div>
                                        <span>Conocimiento actualizado</span>
                                    </div>
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-green">
                                            <i className="fas fa-memory"></i>
                                        </div>
                                        <span>128k contexto</span>
                                    </div>
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-purple">
                                            <i className="fas fa-tachometer-alt"></i>
                                        </div>
                                        <span>Rápido y eficiente</span>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <small className="text-muted">Desde</small>
                                        <div className="model-price">$0.001 / 1K tokens</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 fade-in" style={{animationDelay: '0.3s'}}>
                            <div className="model-card card">
                                <div className="card-body p-4">
                                    <span className="badge model-badge mb-2">OpenAI</span>
                                    <h3 className="model-title">GPT-3.5 Turbo</h3>
                                    <p className="small text-white-50 mb-3">Solución económica para tareas cotidianas y aplicaciones de menor complejidad.</p>
                                    
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-blue">
                                            <i className="fas fa-bolt"></i>
                                        </div>
                                        <span>Respuestas rápidas</span>
                                    </div>
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-green">
                                            <i className="fas fa-layer-group"></i>
                                        </div>
                                        <span>16k contexto</span>
                                    </div>
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-orange">
                                            <i className="fas fa-coins"></i>
                                        </div>
                                        <span>Bajo costo</span>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <small className="text-muted">Desde</small>
                                        <div className="model-price">$0.0005 / 1K tokens</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 fade-in" style={{animationDelay: '0.4s'}}>
                            <div className="model-card card">
                                <div className="card-body p-4">
                                    <span className="badge model-badge mb-2">OpenAI</span>
                                    <h3 className="model-title">GPT-4o Mini</h3>
                                    <p className="small text-white-50 mb-3">Versión optimizada para respuestas instantáneas en aplicaciones ligeras.</p>
                                    
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-blue">
                                            <i className="fas fa-rocket"></i>
                                        </div>
                                        <span>Ultra rápido</span>
                                    </div>
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-green">
                                            <i className="fas fa-compress"></i>
                                        </div>
                                        <span>8k contexto</span>
                                    </div>
                                    <div className="model-feature text-white">
                                        <div className="feature-icon-small feature-orange">
                                            <i className="fas fa-piggy-bank"></i>
                                        </div>
                                        <span>Muy económico</span>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <small className="text-muted">Desde</small>
                                        <div className="model-price">$0.0002 / 1K tokens</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-5" style={{background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))'}}>
                <div className="container py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-8 text-center text-lg-start fade-in">
                            <h2 className="fw-bold mb-3 text-white">¿Listo para transformar tu flujo de trabajo con IA?</h2>
                            <p className="lead mb-0 text-white-50">Regístrate ahora y descubre cómo nuestra plataforma puede impulsar tu productividad.</p>
                        </div>
                        <div className="col-lg-4 text-center text-lg-end mt-4 mt-lg-0 fade-in" style={{animationDelay: '0.2s'}}>
                            <button onClick={handleGetStarted} className="btn btn-light btn-lg px-4">Comenzar a Usar</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 mb-5 mb-lg-0">
                            <a href="#" className="footer-logo" onClick={(e) => e.preventDefault()}>
                                <i className="fas fa-robot me-2"></i>RequestTheAI
                            </a>
                            <p className="footer-about">
                                Plataforma líder en acceso prepago a modelos de inteligencia artificial avanzados. 
                                Ofrecemos soluciones flexibles y escalables para profesionales y empresas.
                            </p>
                        </div>
                        
                        <div className="col-lg-2 col-md-4 mb-4 mb-md-0">
                            <div className="footer-links">
                                <h5>Enlaces</h5>
                                <ul>
                                    <li><a href="#" onClick={(e) => e.preventDefault()}>Inicio</a></li>
                                    <li><a href="#features">Características</a></li>
                                    <li><a href="#models">Modelos</a></li>
                                    <li><a href="#contact">Contacto</a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="col-lg-2 col-md-4 mb-4 mb-md-0">
                            <div className="footer-links">
                                <h5>Legal</h5>
                                <ul>
                                    <li><a href="#" onClick={(e) => e.preventDefault()}>Términos de servicio</a></li>
                                    <li><a href="#" onClick={(e) => e.preventDefault()}>Política de privacidad</a></li>
                                    <li><a href="#" onClick={(e) => e.preventDefault()}>Seguridad</a></li>
                                    <li><a href="#" onClick={(e) => e.preventDefault()}>Cookies</a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="col-lg-4 col-md-4">
                            <div className="footer-links">
                                <h5>Suscríbete</h5>
                                <p style={{opacity: 0.8}} className="mb-3">Recibe las últimas actualizaciones y novedades en tu email.</p>
                                <form className="footer-subscribe d-flex" onSubmit={(e) => e.preventDefault()}>
                                    <input type="email" className="form-control me-2" placeholder="Tu email" />
                                    <button type="submit" className="btn btn-primary">OK</button>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <div className="copyright text-center">
                        <p className="mb-0">© 2023 RequestTheAI. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage; 