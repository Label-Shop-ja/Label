// C:\Proyectos\Label\frontend\src\components\Auth\AccessModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { MESSAGES, LABELS, PLACEHOLDERS } from '../../constants/messages';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, registerSchema } from '../../schemas/authSchemas';
import { useTranslation } from 'react-i18next'; // NUEVO

const lang = 'es'; // O usa un contexto/estado global

/**
 * Componente AccessModal que incluye los formularios de inicio de sesión y registro,
 * el carrusel de texto, y animaciones de Framer Motion.
 * Se abre como un modal sobre la página de bienvenida.
 */
function AccessModal({ onClose }) {
    const [isLogin, setIsLogin] = useState(true); // Estado para alternar entre login y registro
    const { login, register } = useAuth(); // Funciones de autenticación del contexto
    const { showNotification } = useNotification();
    const [loadingAuth, setLoadingAuth] = useState(false); // Estado de carga para las peticiones de autenticación
    const [message, setMessage] = useState(""); // Estado para mensajes de estado (éxito/error)
    const [messageType, setMessageType] = useState("success"); // Estado para tipo de mensaje (éxito/error)

    // Estado y contenido para el carrusel de texto en el MODAL (ahora con descripciones de registro/beneficios)
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselContent = [
        {
            title: "¿Por qué registrarte en Label?",
            description: "Únete a nuestra comunidad y desbloquea herramientas poderosas para gestionar tu negocio, conectar con clientes y crecer en el ecosistema local."
        },
        {
            title: "Beneficios Exclusivos de Label",
            description: "Optimiza inventario, gestiona finanzas, mejora la relación con clientes y toma decisiones inteligentes con nuestros reportes detallados. Todo lo que necesitas en un solo lugar."
        },
        {
            title: "¡Bienvenido de nuevo a Label!",
            description: "Nos alegra verte. Continúa explorando las funcionalidades y herramientas diseñadas para llevar tu negocio al siguiente nivel."
        }
    ];

    // Efecto para el carrusel automático de texto del modal
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % carouselContent.length);
        }, 5000); // Cambia de slide cada 5 segundos
        return () => clearInterval(intervalId); // Limpia el intervalo al desmontar
    }, [carouselContent.length]);

    // Visibilidad de contraseñas
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

    // React Hook Form para login
    const {
        register: registerLogin,
        handleSubmit: handleLogin,
        formState: { errors: loginErrors },
        reset: resetLogin
    } = useForm({
        resolver: yupResolver(loginSchema),
    });

    // React Hook Form para registro
    const {
        register: registerRegister,
        handleSubmit: handleRegister,
        formState: { errors: registerErrors },
        reset: resetRegister
    } = useForm({
        resolver: yupResolver(registerSchema),
    });

    // Envío login
    const handleLoginSubmit = async (data) => {
        setLoadingAuth(true);
        try {
            console.log('data:', data); // <-- Añade esto para depurar
            const email = typeof data.email === 'string' ? data.email : data.email?.target?.value || '';
            const password = typeof data.password === 'string' ? data.password : data.password?.target?.value || '';
            const response = await login(email, password); // <--- Guarda la respuesta en una variable
            // Si tu función register retorna un objeto con code, verifica aquí:
        if (response && response.code === 403) {
            setMessage("No tienes permisos para registrarte.");
            setMessageType("error");
            setLoadingAuth(false);
            return;
        }
            resetLogin();
            setMessage("¡Inicio de sesión exitoso!");
            setMessageType("success");
            setTimeout(() => {
                setMessage("");
            }, 5000); // Ocultar mensaje después de 5 segundos
            onClose();
        } catch (error) {
            
        } finally {
            setLoadingAuth(false);
        }
    };

    // Envío registro
    const handleRegisterSubmit = async (data) => {
        setLoadingAuth(true);
        try {
            const response = await register({
            fullName: data.fullName,
            email: data.email,
            password: data.password
        }); // <--- Guarda la respuesta en una variable
            // Si tu función register retorna un objeto con code, verifica aquí:
        if (response && response.code === 403) {
            setMessage("No tienes permisos para registrarte.");
            setMessageType("error");
            setLoadingAuth(false);
            return;
        }
            setIsLogin(true);
            resetRegister();
            setMessage("¡Registro exitoso!");
            setMessageType("success");
        } catch (error) {
            setMessage("Error al registrarse.");
            setMessageType("error"); // Puedes personalizar el mensaje según el error
            // Usa el mensaje traducible si existe, si no, usa uno genérico
            const errorMessage = t(error.translatedMessage || 'CLIENT_ADD_ERROR');
            showNotification(errorMessage, 'error');
        } finally {
            setLoadingAuth(false);
        }
    };

    // Función para alternar la visibilidad de la contraseña en los inputs
    const togglePasswordVisibility = (inputId) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
        }
    };

    // Variantes de animación para el overlay (fondo con efecto blur)
    const overlayVariants = {
        hidden: { backgroundColor: 'rgba(0, 0, 0, 0)', backdropFilter: 'blur(0px)' },
        visible: { backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', transition: { duration: 0.5 } },
    };

    // Variantes de animación para la tarjeta principal del modal (entrada/salida)
    const cardVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.5, ease: 'easeOut' } },
    };

    // Variantes de animación para los formularios (login/registro)
    const formContentVariants = {
        hidden: { opacity: 0, y: 20, transition: { duration: 0.3 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    // Variantes de animación para el carrusel de texto (VERTICAL)
    const carouselSlideVariants = {
        hidden: { opacity: 0, y: 50 }, // Entra desde abajo
        visible: { opacity: 1, y: 0 }, // Posición visible
        exit: { opacity: 0, y: -50, transition: { ease: "easeOut" } }, // Sale hacia arriba
    };

    return (
        // AnimatePresence permite animar componentes que se montan/desmontan
        <AnimatePresence>
            {/* Overlay del modal que cubre toda la pantalla */}
            <motion.div
                className="fixed inset-0 flex items-center justify-center z-50 text-neutral-light"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden" // Esta animación se activa cuando el modal se cierra (onClose)
                // Se aplica directamente el backdropFilter para el estado inicial
                style={{ backdropFilter: 'blur(0px)' }}
            >
                {/* Contenedor principal de la tarjeta del modal */}
                <motion.div
                    className="w-full max-w-7xl h-[calc(100vh-2rem)] flex flex-col lg:flex-row rounded-lg overflow-hidden shadow-2xl relative"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden" // Esta animación se activa cuando el modal se cierra (onClose)
                >
                    {/* Fondo de imagen y overlay oscuro dentro del modal */}
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://i.imgur.com/eL51q2a.jpg)` }}></div>
                    <div className="absolute inset-0 bg-deep-night-blue opacity-50"></div>

                    {/* Botón de cierre (X) - posicionado en la parte superior derecha del modal */}
                    <button
                        onClick={onClose} // Llama a la función onClose pasada desde App.jsx
                        className="absolute top-4 right-4 text-neutral-light hover:text-copper-rose-accent text-3xl font-bold transition-colors duration-200 z-20"
                        aria-label="Cerrar modal"
                    >
                        &times;
                    </button>

                    {/* Logo de Label en la parte superior izquierda del modal */}
                    <div className="absolute top-8 left-8 z-20">
                        <img src="https://generativelanguage.googleapis.com/v1beta/files/file-1be8bac1-abc2-4630-8b8f-9e854302240d" alt="Logo de Label" className="h-16 sm:h-20 drop-shadow-lg" />
                    </div>

                    {/* Panel Izquierdo: Carrusel de Texto (MOVido desde la derecha) */}
                    <div className="lg:w-1/2 w-full p-8 md:p-12 flex flex-col justify-between items-center text-center bg-black bg-opacity-70 relative z-10">
                        <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={carouselSlideVariants}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="absolute w-full"
                                >
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-copper-rose-accent font-['Cinzel']">
                                        {carouselContent[currentSlide].title}
                                    </h2>
                                    <p className="text-lg md:text-xl text-neutral-light">
                                        {carouselContent[currentSlide].description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {/* Indicadores de carrusel */}
                        <div className="flex space-x-2 mt-6">
                            {carouselContent.map((_, index) => (
                                <span
                                    key={index}
                                    className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                                        index === currentSlide ? 'bg-copper-rose-accent w-5' : 'bg-neutral-gray'
                                    }`}
                                    onClick={() => setCurrentSlide(index)}
                                ></span>
                            ))}
                        </div>
                    </div>

                    {/* Panel Derecho: Formulario (MOVido desde la izquierda) */}
                    <div className="lg:w-1/2 w-full p-8 md:p-12 flex flex-col justify-center bg-deep-night-blue bg-opacity-90 relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-copper-rose-accent mb-6 text-center font-['Cinzel']">
                            {isLogin ? LABELS.LOGIN_TITLE || 'Iniciar Sesión' : LABELS.REGISTER_TITLE || 'Registrarse'}
                        </h2>

                        {/* Mensajes de estado */}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`p-3 mb-4 rounded-md text-sm text-center ${
                                    messageType === 'success' ? 'bg-success-green/20 text-success-green' : 'bg-error-red/20 text-error-red'
                                }`}
                                role="alert"
                            >
                                {message}
                            </motion.div>
                        )}

                        {/* Formularios de Login/Registro con AnimatePresence */}
                        <AnimatePresence mode="wait">
                            {isLogin && (
                                <motion.form
                                    key="loginForm"
                                    className="space-y-6"
                                    onSubmit={handleLogin(handleLoginSubmit)}
                                    variants={formContentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <div>
                                        <label htmlFor="email" className="block text-neutral-light text-sm font-medium mb-2">
                                            {LABELS.EMAIL}
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="w-full p-3 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                            placeholder={PLACEHOLDERS.EMAIL}
                                            {...registerLogin("email")}
                                            disabled={loadingAuth}
                                        />
                                        {loginErrors.email && (
                                            <p className="mt-2 text-error-red text-sm">
                                                {loginErrors.email.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-neutral-light text-sm font-medium mb-2">
                                            {LABELS.PASSWORD}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showLoginPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                className="w-full p-3 pr-10 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                                placeholder={PLACEHOLDERS.PASSWORD}
                                                {...registerLogin("password")}
                                                disabled={loadingAuth}
                                            />
                                            <span
                                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-gray hover:text-neutral-light"
                                                onClick={() => setShowLoginPassword((v) => !v)}
                                            >
                                                {showLoginPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .77 0 1.52.12 2.23.34"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12c-1.274 4.057-5.064 7-9.542 7-1.065 0-2.091-.18-3.04-.51M3.75 3.75L12 12m0 0l-1.5 1.5M12 12l1.5-1.5M12 12l-1.5-1.5M12 12l1.5 1.5M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                    </svg>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-copper-rose-accent text-deep-night-blue font-bold py-3 rounded-md hover:bg-copper-rose-accent/90 transition duration-300 focus:outline-none focus:ring-2 focus:ring-copper-rose-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loadingAuth}
                                    >
                                        {loadingAuth ? 'Iniciando...' : 'Iniciar Sesión'}
                                    </button>
                                    <p className="text-center text-sm text-neutral-gray">
                                        ¿No tienes una cuenta?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setIsLogin(false)}
                                            className="text-action-blue hover:underline focus:outline-none"
                                            disabled={loadingAuth}
                                        >
                                            Registrarse Aquí
                                        </button>
                                    </p>
                                    <p className="text-center text-sm text-neutral-gray">
                                        ¿Olvidaste tu contraseña?{' '}
                                        <a href="#" className="text-action-blue hover:underline">
                                            Recuperar
                                        </a>
                                    </p>
                                </motion.form>
                            )}

                            {!isLogin && (
                                <motion.form
                                    key="registerForm"
                                    className="space-y-6"
                                    onSubmit={handleRegister(handleRegisterSubmit)}
                                    variants={formContentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <div>
                                        <label htmlFor="fullName" className="block text-neutral-light text-sm font-medium mb-2">
                                            {LABELS.FULL_NAME}
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            className="w-full p-3 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                            placeholder={PLACEHOLDERS.FULL_NAME}
                                            {...registerRegister("fullName")}
                                            disabled={loadingAuth}
                                        />
                                        {registerErrors.fullName && (
                                            <p className="mt-2 text-error-red text-sm">
                                                {registerErrors.fullName.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-neutral-light text-sm font-medium mb-2">
                                            {LABELS.EMAIL}
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="w-full p-3 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                            placeholder={PLACEHOLDERS.EMAIL}
                                            {...registerRegister("email")}
                                            disabled={loadingAuth}
                                        />
                                        {registerErrors.email && (
                                            <p className="mt-2 text-error-red text-sm">
                                                {registerErrors.email.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-neutral-light text-sm font-medium mb-2">
                                            {LABELS.PASSWORD}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showRegPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                className="w-full p-3 pr-10 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                                placeholder={PLACEHOLDERS.PASSWORD}
                                                {...registerRegister("password")}
                                                disabled={loadingAuth}
                                            />
                                            <span
                                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-gray hover:text-neutral-light"
                                                onClick={() => setShowRegPassword((v) => !v)}
                                            >
                                                {showRegPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .77 0 1.52.12 2.23.34"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12c-1.274 4.057-5.064 7-9.542 7-1.065 0-2.091-.18-3.04-.51M3.75 3.75L12 12m0 0l-1.5 1.5M12 12l1.5-1.5M12 12l-1.5-1.5M12 12l1.5 1.5M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                    </svg>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-neutral-light text-sm font-medium mb-2">
                                            {LABELS.CONFIRM_PASSWORD}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showRegConfirmPassword ? "text" : "password"}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                className="w-full p-3 pr-10 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                                placeholder={PLACEHOLDERS.PASSWORD}
                                                {...registerRegister("confirmPassword")}
                                                disabled={loadingAuth}
                                            />
                                            <span
                                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-gray hover:text-neutral-light"
                                                onClick={() => setShowRegConfirmPassword((v) => !v)}
                                            >
                                                {showRegConfirmPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .77 0 1.52.12 2.23.34"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12c-1.274 4.057-5.064 7-9.542 7-1.065 0-2.091-.18-3.04-.51M3.75 3.75L12 12m0 0l-1.5 1.5M12 12l1.5-1.5M12 12l-1.5-1.5M12 12l1.5 1.5M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                    </svg>
                                                )}
                                            </span>
                                        </div>
                                        {registerErrors.confirmPassword && (
                                            <p className="mt-2 text-error-red text-sm">
                                                {registerErrors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-copper-rose-accent text-deep-night-blue font-bold py-3 rounded-md hover:bg-copper-rose-accent/90 transition duration-300 focus:outline-none focus:ring-2 focus:ring-copper-rose-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loadingAuth}
                                    >
                                        {loadingAuth ? 'Registrando...' : 'Registrarse'}
                                    </button>
                                    <p className="text-center text-sm text-neutral-gray">
                                        ¿Ya tienes una cuenta?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setIsLogin(true)}
                                            className="text-action-blue hover:underline focus:outline-none"
                                            disabled={loadingAuth}
                                        >
                                            Iniciar sesión
                                        </button>
                                    </p>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default AccessModal;
