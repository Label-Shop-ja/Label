// C:\Proyectos\Label\frontend\src\components\Auth\AccessModal.jsx
// AccessModal.jsx
import PropTypes from 'prop-types'; // eslint-disable-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';
import { MESSAGES, LABELS, PLACEHOLDERS } from '../../constants/messages';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, registerSchema } from '../../schemas/authSchemas';
import useAuth from "../../hooks/useAuth";
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

function AccessModal({ onClose, onOpenLegalModal }) {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register, isLoading, isError, message, reset, isAuthenticated } = useAuth();
    // Ahora, gracias a useCallback en el contexto, esta función `showNotification` es estable.
    const { showNotification } = useNotification();

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
        formState: { errors: loginErrors, isValid: isLoginValid },
    } = useForm({
        resolver: yupResolver(loginSchema),
        mode: 'onChange', // Valida en cada cambio para una respuesta instantánea
    });

    const {
        register: registerRegister,
        handleSubmit: handleRegister,
        formState: { errors: registerErrors, isValid: isRegisterValid },
    } = useForm({
        // El schema de registro se actualizará para incluir el checkbox
        resolver: yupResolver(registerSchema),
        mode: 'onChange', // Valida en cada cambio para una respuesta instantánea
    });

    const handleLoginSubmit = (data) => {
        login({ email: data.email, password: data.password });
    };

    const handleRegisterSubmit = (data) => {
        register({
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            // El campo 'terms' es validado por el schema pero no se envía al backend
        });
    };

    const overlayVariants = {
        hidden: { backgroundColor: 'rgba(0, 0, 0, 0)', backdropFilter: 'blur(0px)' },
        visible: { backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', transition: { duration: 0.5 } },
    };

    const cardVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20, duration: 0.5 } },
        exit: { y: 50, opacity: 0, transition: { duration: 0.3 } }
    };

    const formContentVariants = {
        hidden: { opacity: 0, x: isLogin ? -20 : 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, x: isLogin ? 20 : -20, transition: { duration: 0.2, ease: 'easeIn' } },
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 flex items-center justify-center z-50 text-text-base"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-surface-secondary rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4">
                        <div className="grid grid-cols-2 gap-2 bg-surface p-1 rounded-lg mb-6">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`w-full p-2 rounded-md text-sm font-semibold transition-colors duration-300 ${isLogin ? 'bg-primary text-white' : 'text-text-muted hover:bg-white/5'}`}
                            >
                                {LABELS.LOGIN_TITLE || 'Iniciar Sesión'}
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`w-full p-2 rounded-md text-sm font-semibold transition-colors duration-300 ${!isLogin ? 'bg-primary text-white' : 'text-text-muted hover:bg-white/5'}`}
                            >
                                {LABELS.REGISTER_TITLE || 'Registrarse'}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.p key={isLogin ? 'login-text' : 'register-text'} className="text-center text-text-muted mb-6 text-sm" variants={formContentVariants} initial="hidden" animate="visible" exit="hidden">
                                {isLogin ? 'Bienvenido de nuevo. Accede a tu cuenta.' : 'Crea una cuenta para empezar a gestionar tu negocio.'}
                            </motion.p>
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.form
                                    key="loginForm"
                                    className="space-y-4"
                                    onSubmit={handleLogin(handleLoginSubmit)}
                                    variants={formContentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    {/* Formulario de Login */}
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input type="email" id="email-login" className="w-full p-3 pl-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary" placeholder={PLACEHOLDERS.EMAIL} {...registerLogin("email")} disabled={isLoading} />
                                        {loginErrors.email && <p className="mt-1 text-error text-xs">{loginErrors.email.message}</p>}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input type={showLoginPassword ? "text" : "password"} id="password-login" className="w-full p-3 pl-10 pr-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary" placeholder={PLACEHOLDERS.PASSWORD} {...registerLogin("password")} disabled={isLoading} />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-base" onClick={() => setShowLoginPassword((v) => !v)}>
                                            {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        {loginErrors.password && <p className="mt-1 text-error text-xs">{loginErrors.password.message}</p>}
                                    </div>
                                    <div className="text-right">
                                        <button type="button" className="text-sm font-semibold text-primary hover:underline" disabled={isLoading}>
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                    <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isLoginValid || isLoading}>
                                        {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                                    </button>
                                    <p className="text-center text-sm text-text-muted">
                                        ¿No tienes una cuenta?{' '}
                                        <button type="button" onClick={() => setIsLogin(false)} className="text-primary hover:underline font-semibold" disabled={isLoading}>
                                            Registrarse Aquí
                                        </button>
                                    </p>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="registerForm"
                                    className="space-y-4"
                                    onSubmit={handleRegister(handleRegisterSubmit)}
                                    variants={formContentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    {/* Formulario de Registro */}
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input type="text" id="fullName-register" className="w-full p-3 pl-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary" placeholder={PLACEHOLDERS.FULL_NAME} {...registerRegister("fullName")} disabled={isLoading} />
                                        {registerErrors.fullName && <p className="mt-1 text-error text-xs">{registerErrors.fullName.message}</p>}
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input type="email" id="email-register" className="w-full p-3 pl-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary" placeholder={PLACEHOLDERS.EMAIL} {...registerRegister("email")} disabled={isLoading} />
                                        {registerErrors.email && <p className="mt-1 text-error text-xs">{registerErrors.email.message}</p>}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input type={showRegPassword ? "text" : "password"} id="password-register" className="w-full p-3 pl-10 pr-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary" placeholder={PLACEHOLDERS.PASSWORD} {...registerRegister("password")} disabled={isLoading} />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-base" onClick={() => setShowRegPassword((v) => !v)}>
                                            {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        {registerErrors.password && <p className="mt-1 text-error text-xs">{registerErrors.password.message}</p>}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input type={showRegConfirmPassword ? "text" : "password"} id="confirmPassword-register" className="w-full p-3 pl-10 pr-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary" placeholder={PLACEHOLDERS.CONFIRM_PASSWORD} {...registerRegister("confirmPassword")} disabled={isLoading} />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-base" onClick={() => setShowRegConfirmPassword((v) => !v)}>
                                            {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        {registerErrors.confirmPassword && <p className="mt-1 text-error text-xs">{registerErrors.confirmPassword.message}</p>}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input type="checkbox" id="terms" {...registerRegister("terms")} className="h-4 w-4 rounded border-surface-secondary text-primary focus:ring-primary" />
                                        <label htmlFor="terms" className="text-sm text-text-muted">
                                            Acepto los{' '}
                                            <button type="button" onClick={() => onOpenLegalModal('terms')} className="font-semibold text-primary hover:underline">Términos de Servicio</button>
                                            {' '}y la{' '}
                                            <button type="button" onClick={() => onOpenLegalModal('privacy')} className="font-semibold text-primary hover:underline">Política de Privacidad</button>.
                                        </label>
                                    </div>
                                    {registerErrors.terms && <p className="text-error text-xs">{registerErrors.terms.message}</p>}

                                    <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isRegisterValid || isLoading}>
                                        {isLoading ? 'Registrando...' : 'Registrarse'}
                                    </button>
                                    <p className="text-center text-sm text-text-muted">
                                        ¿Ya tienes una cuenta?{' '}
                                        <button type="button" onClick={() => setIsLogin(true)} className="text-primary hover:underline font-semibold" disabled={isLoading}>
                                            Iniciar sesión
                                        </button>
                                    </p>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="relative flex pt-6 pb-4 items-center">
                            <div className="flex-grow border-t border-surface-secondary"></div>
                            <span className="flex-shrink mx-4 text-text-muted text-sm">O continúa con</span>
                            <div className="flex-grow border-t border-surface-secondary"></div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* El enlace apunta a la ruta del backend que iniciará el flujo de Google */}
                            <a
                                href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[#4285F4] hover:bg-[#357ae8] text-white font-semibold transition-colors duration-300"
                            >
                                <FaGoogle /> Google
                            </a>
                            {/* El botón de Facebook se aplaza temporalmente
                            <a
                                href={`${import.meta.env.VITE_API_BASE_URL}/auth/facebook`}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold transition-colors duration-300"
                            >
                                <FaFacebook /> Facebook
                            </a> */}
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

AccessModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onOpenLegalModal: PropTypes.func.isRequired,
};

export default AccessModal;
