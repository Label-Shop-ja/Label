import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';

// Schema de validación para el formulario
const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email('Debe ser un correo válido').required('El correo es obligatorio'),
});

const ForgotPasswordModal = ({ onClose, onBackToLogin }) => {
  // Reemplazamos el estado local por el estado de Redux a través del hook
  const { forgotPassword, isLoading, forgotPasswordStatus, message, reset, isError } = useAuth();
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  // Efecto para manejar notificaciones de error
  React.useEffect(() => {
    if (isError && forgotPasswordStatus === 'failed') {
      showNotification(message, 'error');
      reset(); // Limpia el estado de error para no mostrarlo de nuevo y permitir otro intento
    }
  }, [isError, forgotPasswordStatus, message, showNotification, reset]);

  // Efecto para limpiar el estado al desmontar el modal
  React.useEffect(() => {
    return () => {
      // Si el estado no es 'idle', lo reseteamos para que la próxima vez que se abra el modal esté limpio.
      if (forgotPasswordStatus !== 'idle') {
        reset();
      }
    };
  }, [reset, forgotPasswordStatus]);

  const onSubmit = (data) => {
    forgotPassword(data.email);
  };

  // Variantes de animación (consistentes con AccessModal)
  const cardVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 25 } },
    exit: { y: "100%", opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }
  };

  // La vista de éxito se muestra cuando el estado de Redux es 'succeeded'
  const isSuccess = forgotPasswordStatus === 'succeeded';

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
          {!isSuccess ? (
            <>
              <h2 className="text-2xl font-bold text-text-base mb-2">¿Olvidaste tu Contraseña?</h2>
              <p className="text-text-muted mb-6">No te preocupes. Ingresa tu correo y te enviaremos un enlace para que la recuperes.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="email"
                    id="email-forgot"
                    className="w-full p-3 pl-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="tu.correo@ejemplo.com"
                    {...register("email")}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="mt-1 text-error text-xs">{errors.email.message}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isValid || isLoading}
                >
                  {isLoading && <Loader2 className="animate-spin" />}
                  {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </button>
              </form>
            </>
          ) : (
            <div className="animate-fadeIn">
              <Mail className="mx-auto h-16 w-16 text-success mb-4" />
              <h2 className="text-2xl font-bold text-text-base mb-2">¡Revisa tu Correo!</h2>
              <p className="text-text-muted mb-6">{message || 'Si existe una cuenta con ese correo, hemos enviado un enlace para restablecer tu contraseña. El enlace expirará pronto.'}</p>
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
