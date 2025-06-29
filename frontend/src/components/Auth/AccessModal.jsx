// C:\Proyectos\Label\frontend\src\components\Auth\AccessModal.jsx
// AccessModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';
import { MESSAGES, LABELS, PLACEHOLDERS } from '../../constants/messages';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, registerSchema } from '../../schemas/authSchemas';
import useAuth from "../../hooks/useAuth";

function AccessModal({ onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register, isLoading, isError, message, reset, isAuthenticated } = useAuth();
    // Ahora, gracias a useCallback en el contexto, esta función `showNotification` es estable.
    const { showNotification } = useNotification();

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

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % carouselContent.length);
        }, 5000);
        return () => clearInterval(intervalId);
    }, [carouselContent.length]);

    // Este useEffect ahora es seguro y no causará bucles infinitos.
    useEffect(() => {
        // Se ejecuta solo cuando `isError` y `message` son verdaderos.
        if (isError && message) {
            // Llama a la función estable del contexto.
            showNotification(message, 'error');
            // Limpia el estado de error en Redux. ¡Esto es una excelente práctica!
            // Evita que la notificación aparezca de nuevo si el componente se vuelve a renderizar por otra razón.
            reset();
        }
    }, [isError, message, showNotification, reset]); // El array de dependencias es correcto.

    // Este efecto maneja el caso de éxito.
    useEffect(() => {
        if (isAuthenticated) {
            onClose(); // Cierra el modal al autenticarse.
        }
        // La función de limpieza es ideal para resetear el estado si el usuario cierra el modal manualmente.
        return () => {
            reset();
        };
    }, [isAuthenticated, onClose, reset]);

    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

    const {
        register: registerLogin,
        handleSubmit: handleLogin,
        formState: { errors: loginErrors },
    } = useForm({
        resolver: yupResolver(loginSchema),
    });

    const {
        register: registerRegister,
        handleSubmit: handleRegister,
        formState: { errors: registerErrors },
    } = useForm({
        resolver: yupResolver(registerSchema),
    });

    const handleLoginSubmit = (data) => {
        login({ email: data.email, password: data.password });
    };

    const handleRegisterSubmit = (data) => {
        register({
            fullName: data.fullName,
            email: data.email,
            password: data.password
        });
    };

    const overlayVariants = {
        hidden: { backgroundColor: 'rgba(0, 0, 0, 0)', backdropFilter: 'blur(0px)' },
        visible: { backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', transition: { duration: 0.5 } },
    };

    const cardVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.5, ease: 'easeOut' } },
    };

    const formContentVariants = {
        hidden: { opacity: 0, y: 20, transition: { duration: 0.3 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    const carouselSlideVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -50, transition: { ease: "easeOut" } },
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 flex items-center justify-center z-50 text-neutral-light"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{ backdropFilter: 'blur(0px)' }}
            >
                <motion.div
                    className="w-full max-w-7xl h-[calc(100vh-2rem)] flex flex-col lg:flex-row rounded-lg overflow-hidden shadow-2xl relative"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://i.imgur.com/eL51q2a.jpg)` }}></div>
                    <div className="absolute inset-0 bg-deep-night-blue opacity-50"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-neutral-light hover:text-copper-rose-accent text-3xl font-bold transition-colors duration-200 z-20"
                        aria-label="Cerrar modal"
                    >
                        &times;
                    </button>

                    <div className="absolute top-8 left-8 z-20">
                        <img src="https://generativelanguage.googleapis.com/v1beta/files/file-1be8bac1-abc2-4630-8b8f-9e854302240d" alt="Logo de Label" className="h-16 sm:h-20 drop-shadow-lg" />
                    </div>

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

                    <div className="lg:w-1/2 w-full p-8 md:p-12 flex flex-col justify-center bg-deep-night-blue bg-opacity-90 relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-copper-rose-accent mb-6 text-center font-['Cinzel']">
                            {isLogin ? LABELS.LOGIN_TITLE || 'Iniciar Sesión' : LABELS.REGISTER_TITLE || 'Registrarse'}
                        </h2>

                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.form
                                    key="loginForm"
                                    className="space-y-6"
                                    onSubmit={handleLogin(handleLoginSubmit)}
                                    variants={formContentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    {/* Formulario de Login */}
                                    <div>
                                        <label htmlFor="email-login" className="block text-neutral-light text-sm font-medium mb-2">
                                            {LABELS.EMAIL}
                                        </label>
                                        <input
                                            type="email"
                                            id="email-login"
                                            className="w-full p-3 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                            placeholder={PLACEHOLDERS.EMAIL}
                                            {...registerLogin("email")}
                                            disabled={isLoading}
                                        />
                                        {loginErrors.email && <p className="mt-2 text-error-red text-sm">{loginErrors.email.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="password-login" className="block text-neutral-light text-sm font-medium mb-2">
                                            {LABELS.PASSWORD}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showLoginPassword ? "text" : "password"}
                                                id="password-login"
                                                className="w-full p-3 pr-10 bg-neutral-gray/20 rounded-md border border-neutral-gray/30 text-neutral-light focus:outline-none focus:ring-2 focus:ring-copper-rose-accent"
                                                placeholder={PLACEHOLDERS.PASSWORD}
                                                {...registerLogin("password")}
                                                disabled={isLoading}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-gray hover:text-neutral-light" onClick={() => setShowLoginPassword((v) => !v)}>
                                                {/* Icono de ojo */}
                                            </span>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-copper-rose-accent text-deep-night-blue font-bold py-3 rounded-md hover:bg-copper-rose-accent/90 transition duration-300 disabled:opacity-50" disabled={isLoading}>
                                        {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                                    </button>
                                    <p className="text-center text-sm text-neutral-gray">
                                        ¿No tienes una cuenta?{' '}
                                        <button type="button" onClick={() => setIsLogin(false)} className="text-action-blue hover:underline" disabled={isLoading}>
                                            Registrarse Aquí
                                        </button>
                                    </p>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="registerForm"
                                    className="space-y-6"
                                    onSubmit={handleRegister(handleRegisterSubmit)}
                                    variants={formContentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    {/* Formulario de Registro */}
                                    <div>
                                        <label htmlFor="fullName-register" className="block text-neutral-light text-sm font-medium mb-2">{LABELS.FULL_NAME}</label>
                                        <input type="text" id="fullName-register" className="w-full p-3 bg-neutral-gray/20 rounded-md border border-neutral-gray/30" placeholder={PLACEHOLDERS.FULL_NAME} {...registerRegister("fullName")} disabled={isLoading} />
                                        {registerErrors.fullName && <p className="mt-2 text-error-red text-sm">{registerErrors.fullName.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email-register" className="block text-neutral-light text-sm font-medium mb-2">{LABELS.EMAIL}</label>
                                        <input type="email" id="email-register" className="w-full p-3 bg-neutral-gray/20 rounded-md border border-neutral-gray/30" placeholder={PLACEHOLDERS.EMAIL} {...registerRegister("email")} disabled={isLoading} />
                                        {registerErrors.email && <p className="mt-2 text-error-red text-sm">{registerErrors.email.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="password-register" className="block text-neutral-light text-sm font-medium mb-2">{LABELS.PASSWORD}</label>
                                        <div className="relative">
                                            <input type={showRegPassword ? "text" : "password"} id="password-register" className="w-full p-3 pr-10 bg-neutral-gray/20 rounded-md border border-neutral-gray/30" placeholder={PLACEHOLDERS.PASSWORD} {...registerRegister("password")} disabled={isLoading} />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowRegPassword((v) => !v)}>
                                                {/* Icono de ojo */}
                                            </span>
                                        </div>
                                        {registerErrors.password && <p className="mt-2 text-error-red text-sm">{registerErrors.password.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword-register" className="block text-neutral-light text-sm font-medium mb-2">{LABELS.CONFIRM_PASSWORD}</label>
                                        <div className="relative">
                                            <input type={showRegConfirmPassword ? "text" : "password"} id="confirmPassword-register" className="w-full p-3 pr-10 bg-neutral-gray/20 rounded-md border border-neutral-gray/30" placeholder={PLACEHOLDERS.PASSWORD} {...registerRegister("confirmPassword")} disabled={isLoading} />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowRegConfirmPassword((v) => !v)}>
                                                {/* Icono de ojo */}
                                            </span>
                                        </div>
                                        {registerErrors.confirmPassword && <p className="mt-2 text-error-red text-sm">{registerErrors.confirmPassword.message}</p>}
                                    </div>
                                    <button type="submit" className="w-full bg-copper-rose-accent text-deep-night-blue font-bold py-3 rounded-md hover:bg-copper-rose-accent/90 transition duration-300 disabled:opacity-50" disabled={isLoading}>
                                        {isLoading ? 'Registrando...' : 'Registrarse'}
                                    </button>
                                    <p className="text-center text-sm text-neutral-gray">
                                        ¿Ya tienes una cuenta?{' '}
                                        <button type="button" onClick={() => setIsLogin(true)} className="text-action-blue hover:underline" disabled={isLoading}>
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
