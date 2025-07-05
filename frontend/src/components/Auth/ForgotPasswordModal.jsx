import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, Loader2, Hash } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

// Schema de validación para el formulario
const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email('Debe ser un correo válido').required('El correo es obligatorio'),
});

const verifyCodeSchema = yup.object().shape({
  code: yup.string().matches(/^[0-9]{6}$/, 'El código debe tener 6 dígitos').required('El código es obligatorio'),
});

const ForgotPasswordModal = ({ onClose, onBackToLogin }) => {
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [userEmail, setUserEmail] = useState(''); // Guardamos el email para el segundo paso

  const {
    forgotPassword,
    verifyResetCode,
    isLoading,
    forgotPasswordStatus,
    verifyCodeStatus,
    message,
    reset,
    isError,
  } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors, isValid: isEmailValid },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const {
    register: registerCode,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors, isValid: isCodeValid },
  } = useForm({
    resolver: yupResolver(verifyCodeSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (isError && (forgotPasswordStatus === 'failed' || verifyCodeStatus === 'failed')) {
      showNotification(message, 'error');
      reset();
    }
  }, [isError, forgotPasswordStatus, verifyCodeStatus, message, showNotification, reset]);

  useEffect(() => {
    if (forgotPasswordStatus === 'succeeded') {
      setStep('code');
    }
    if (verifyCodeStatus === 'succeeded') {
      onClose(); // Cierra el modal
      navigate('/reset-password'); // Navega a la página para establecer la nueva contraseña
    }
  }, [forgotPasswordStatus, verifyCodeStatus, navigate, onClose]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const onEmailSubmit = (data) => {
    setUserEmail(data.email);
    forgotPassword(data.email);
  };

  const onCodeSubmit = (data) => {
    verifyResetCode({ email: userEmail, code: data.code });
  };

  // Variantes de animación (consistentes con AccessModal)
  const cardVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 25 } },
    exit: { y: "100%", opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }
  };
  
  return (
    <motion.div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50 text-text-base bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-surface/80 backdrop-blur-xl border-t sm:border border-surface-secondary rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          {step === 'email' && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-text-base mb-2">Recuperar Contraseña</h2>
              <p className="text-text-muted mb-6">Ingresa tu correo y te enviaremos un código de 6 dígitos para que la recuperes.</p>
              <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4 text-left">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="email"
                    id="email-forgot"
                    className="w-full p-3 pl-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="tu.correo@ejemplo.com"
                    {...registerEmail("email")}
                    disabled={isLoading}
                  />
                  {emailErrors.email && <p className="mt-1 text-error text-xs">{emailErrors.email.message}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isEmailValid || isLoading}
                >
                  {isLoading && <Loader2 className="animate-spin" />}
                  {isLoading ? 'Enviando...' : 'Enviar Código'}
                </button>
              </form>
            </div>
          )}

          {step === 'code' && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-text-base mb-2">Verifica tu Identidad</h2>
              <p className="text-text-muted mb-6">Hemos enviado un código a <strong>{userEmail}</strong>. Ingrésalo a continuación.</p>
              <form onSubmit={handleCodeSubmit(onCodeSubmit)} className="space-y-4 text-left">
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="text"
                    id="code-forgot"
                    className="w-full p-3 pl-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="123456"
                    {...registerCode("code")}
                    disabled={isLoading}
                  />
                  {codeErrors.code && <p className="mt-1 text-error text-xs">{codeErrors.code.message}</p>}
                </div>
                <button type="submit" className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isCodeValid || isLoading}>
                  {isLoading && <Loader2 className="animate-spin" />}
                  {isLoading ? 'Verificando...' : 'Verificar Código'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={onBackToLogin}
              className="text-sm font-semibold text-primary hover:underline flex items-center justify-center mx-auto gap-2 disabled:opacity-50"
              disabled={isLoading}
            >
              <ArrowLeft size={16} />
              Volver a Iniciar Sesión
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

ForgotPasswordModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onBackToLogin: PropTypes.func.isRequired,
};

export default ForgotPasswordModal;
