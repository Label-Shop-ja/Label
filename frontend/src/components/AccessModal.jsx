// C:\Proyectos\Label\frontend\src\components\AccessModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

/**
 * Componente AccessModal que incluye los formularios de inicio de sesión y registro,
 * el carrusel de texto, y animaciones de Framer Motion.
 * Se abre como un modal sobre la página de bienvenida.
 */
function AccessModal({ onClose }) {
    const [isLogin, setIsLogin] = useState(true); // Estado para alternar entre login y registro
    const [message, setMessage] = useState(''); // Mensajes de éxito/error
    const [messageType, setMessageType] = useState(''); // Tipo de mensaje: 'success' o 'error'
    const { login, register } = useAuth(); // Funciones de autenticación del contexto

    // Estados para los campos de los formularios
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regFullName, setRegFullName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [loadingAuth, setLoadingAuth] = useState(false); // Estado de carga para las peticiones de autenticación

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

    // Función para mostrar mensajes de estado (éxito/error)
    const displayMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000); // El mensaje desaparece después de 5 segundos
    };

    // Manejador para el envío del formulario de inicio de sesión
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoadingAuth(true); // Activa el estado de carga
        displayMessage(''); // Limpia mensajes anteriores

        try {
            await login(loginEmail, loginPassword); // Llama a la función de login del contexto
            // Si la promesa se resuelve (no lanza error), significa que el login fue exitoso
            onClose(); // Cierra el modal
        } catch (error) {
            // Si la promesa lanza un error, lo capturamos y mostramos el mensaje
            displayMessage(error, 'error'); // 'error' contendrá el mensaje lanzado por AuthContext
        } finally {
            setLoadingAuth(false); // Desactiva el estado de carga al finalizar, sea éxito o error
        }
    };

    // Manejador para el envío del formulario de registro
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoadingAuth(true); // Activa el estado de carga
        displayMessage(''); // Limpia mensajes anteriores

        if (regPassword !== regConfirmPassword) {
            displayMessage('Las contraseñas no coinciden.', 'error');
            setLoadingAuth(false);
            return;
        }

        try {
            await register({ fullName: regFullName, email: regEmail, password: regPassword }); // Llama a la función de registro del contexto
            // Si la promesa se resuelve (no lanza error), significa que el registro fue exitoso
            displayMessage('¡Registro exitoso! Por favor, inicia sesión.', 'success'); // Mensaje de éxito
            setIsLogin(true); // Cambia a la vista de login
            // Limpia los campos del formulario de registro
            setRegFullName('');
            setRegEmail('');
            setRegPassword('');
            setRegConfirmPassword('');
        } catch (error) {
            // Si la promesa lanza un error, lo capturamos y mostramos el mensaje
            displayMessage(error, 'error'); // 'error' contendrá el mensaje lanzado por AuthContext
        } finally {
            setLoadingAuth(false); // Desactiva el estado de carga al finalizar, sea éxito o error
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
                        <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden"> {/* Añadido overflow-hidden para el carrusel vertical */}
                            <AnimatePresence mode="wait"> {/* AnimatePresence para animaciones de salida */}
                                {carouselContent.map((slide, index) => (
                                    <motion.div
                                        key={index}
                                        initial="hidden"
                                        animate={index === currentSlide ? "visible" : "hidden"}
                                        exit="exit" // Se activa la variante de salida
                                        variants={carouselSlideVariants} // Usa las variantes de animación vertical
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={`absolute w-full`} // Mantener absolute w-full para superposición
                                    >
                                        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-copper-rose-accent font-['Cinzel']">
                                            {slide.title}
                                        </h2>
                                        <p className="text-lg md:text-xl text-neutral-light">
                                            {slide.description}
                                        </p>
                                    </motion.div>
                                ))}
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
                            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
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
                                    onSubmit={handleLoginSubmit}
                                    variants={formContentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <div>
                                        <label htmlFor="loginEmail" className="block text-neutral-light text-sm font-medium mb-2">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            id="loginEmail"
                                            name="loginEmail"
                                            className="w-full p-3 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                            placeholder="tu@correo.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            required
                                            disabled={loadingAuth}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="loginPassword" className="block text-neutral-light text-sm font-medium mb-2">
                                            Contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                id="loginPassword"
                                                name="loginPassword"
                                                className="w-full p-3 pr-10 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                                placeholder="••••••••"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                required
                                                disabled={loadingAuth}
                                            />
                                            <span
                                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-gray hover:text-neutral-light"
                                                onClick={() => togglePasswordVisibility('loginPassword')}
                                            >
                                                {document.getElementById('loginPassword')?.type === 'password' ? (
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
                                    onSubmit={handleRegisterSubmit}
                                    variants={formContentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <div>
                                        <label htmlFor="regFullName" className="block text-neutral-light text-sm font-medium mb-2">
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            id="regFullName"
                                            name="regFullName"
                                            className="w-full p-3 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                            placeholder="Ej. Juan Pérez"
                                            value={regFullName}
                                            onChange={(e) => setRegFullName(e.target.value)}
                                            required
                                            disabled={loadingAuth}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="regEmail" className="block text-neutral-light text-sm font-medium mb-2">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            id="regEmail"
                                            name="regEmail"
                                            className="w-full p-3 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                            placeholder="tu@correo.com"
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                            required
                                            disabled={loadingAuth}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="regPassword" className="block text-neutral-light text-sm font-medium mb-2">
                                            Contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                id="regPassword"
                                                name="regPassword"
                                                className="w-full p-3 pr-10 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                                placeholder="••••••••"
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                                required
                                                disabled={loadingAuth}
                                            />
                                            <span
                                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-gray hover:text-neutral-light"
                                                onClick={() => togglePasswordVisibility('regPassword')}
                                            >
                                                {document.getElementById('regPassword')?.type === 'password' ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
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
                                        <label htmlFor="regConfirmPassword" className="block text-neutral-light text-sm font-medium mb-2">
                                            Confirmar Contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                id="regConfirmPassword"
                                                name="regConfirmPassword"
                                                className="w-full p-3 pr-10 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                                placeholder="••••••••"
                                                value={regConfirmPassword}
                                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                                                required
                                                disabled={loadingAuth}
                                            />
                                            <span
                                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-gray hover:text-neutral-light"
                                                onClick={() => togglePasswordVisibility('regConfirmPassword')}
                                            >
                                                {document.getElementById('regConfirmPassword')?.type === 'password' ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
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
                                        {loadingAuth ? 'Registrando...' : 'Registrarse'}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* Enlaces para cambiar entre Login y Registro */}
                        <p className="text-center text-sm text-neutral-gray mt-6">
                            {isLogin ? (
                                <>
                                    ¿No tienes cuenta?{' '}
                                    <button
                                        type="button"
                                        className="text-action-blue hover:underline font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setIsLogin(false)}
                                        disabled={loadingAuth}
                                    >
                                        Regístrate aquí
                                    </button>
                                </>
                            ) : (
                                <>
                                    ¿Ya tienes una cuenta?{' '}
                                    <button
                                        type="button"
                                        className="text-action-blue hover:underline font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setIsLogin(true)}
                                        disabled={loadingAuth}
                                    >
                                        Inicia sesión
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default AccessModal;
