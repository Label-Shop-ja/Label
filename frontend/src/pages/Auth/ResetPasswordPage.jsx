import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';

const resetPasswordSchema = yup.object().shape({
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir').required('Confirma tu contraseña'),
});

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { resetPassword, isLoading, resetPasswordStatus, message, isError, reset } = useAuth();
  const { showNotification } = useNotification();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (isError && resetPasswordStatus === 'failed') {
      showNotification(message, 'error');
      reset();
    }
  }, [isError, resetPasswordStatus, message, showNotification, reset]);

  const onSubmit = (data) => {
    resetPassword({ password: data.password, confirmPassword: data.confirmPassword });
  };
  
  const isSuccess = resetPasswordStatus === 'succeeded';

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-background p-4">
        <div
          className="fixed inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(https://res.cloudinary.com/dnkr9tvtq/image/upload/w_1920,h_1080,c_fill,q_auto,f_auto/v1751596741/img2.wallspic.com-luz-graficos_vectoriales-azul-ilustracion-diseno-5000x5000_jjastz.jpg)`,
          }}
        ></div>
        <div className="fixed inset-0 bg-gradient-to-r from-background via-background/70 to-transparent z-2"></div>

        <motion.div
            className="relative z-10 w-full max-w-md bg-surface/80 backdrop-blur-xl border border-surface-secondary rounded-2xl shadow-2xl shadow-black/40 overflow-hidden p-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {!isSuccess ? (
                <>
                    <h1 className="text-3xl font-bold text-text-base mb-2">Restablecer Contraseña</h1>
                    <p className="text-text-muted mb-8">Ingresa tu nueva contraseña a continuación.</p>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="w-full p-3 pl-10 pr-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Nueva contraseña"
                                {...register("password")}
                                disabled={isLoading}
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-base" onClick={() => setShowPassword((v) => !v)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            {errors.password && <p className="mt-1 text-error text-xs">{errors.password.message}</p>}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                className="w-full p-3 pl-10 pr-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Confirmar nueva contraseña"
                                {...register("confirmPassword")}
                                disabled={isLoading}
                            />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-base" onClick={() => setShowConfirmPassword((v) => !v)}>
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            {errors.confirmPassword && <p className="mt-1 text-error text-xs">{errors.confirmPassword.message}</p>}
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!isValid || isLoading}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                        </button>
                    </form>
                </>
            ) : (
                <div className="animate-fadeIn">
                    <CheckCircle className="mx-auto h-16 w-16 text-success mb-4" />
                    <h2 className="text-2xl font-bold text-text-base mb-2">¡Contraseña Actualizada!</h2>
                    <p className="text-text-muted mb-6">{message}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity duration-300"
                    >
                        Ir a Iniciar Sesión
                    </button>
                </div>
            )}
        </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
