import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../../schemas/authSchemas';
import useAddAccount from '../../hooks/useAddAccount';
import { Lock, Mail, Eye, EyeOff, X } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';

function AddAccountModal({ isOpen, onClose, onAccountAdded }) {
  const { addAccount, isLoading, isError, message, reset } = useAddAccount();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset: resetForm
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (isError && message) {
      // El hook ya maneja las notificaciones
    }
  }, [isError, message]);

  const handleLoginSubmit = async (data) => {
    const result = await addAccount(data, 'local');
    
    if (result.success) {
      resetForm();
      reset();
      onAccountAdded?.(result.user);
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface rounded-lg shadow-xl w-full max-w-md mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-secondary">
            <h2 className="text-lg font-semibold text-text-base">Añadir cuenta</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-surface-secondary rounded-full transition-colors"
            >
              <X size={20} className="text-text-muted" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-center text-text-muted mb-6 text-sm">
              Inicia sesión con otra cuenta para añadirla a tu lista
            </p>

            <form onSubmit={handleSubmit(handleLoginSubmit)} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  className="w-full p-3 pl-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Correo electrónico"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-error text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-3 pl-10 pr-10 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Contraseña"
                  {...register("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-base"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-error text-xs">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isValid || isLoading}
              >
                {isLoading ? 'Añadiendo...' : 'Añadir cuenta'}
              </button>
            </form>

            <div className="relative flex pt-4 pb-4 items-center">
              <div className="flex-grow border-t border-surface-secondary"></div>
              <span className="flex-shrink mx-4 text-text-muted text-sm">O</span>
              <div className="flex-grow border-t border-surface-secondary"></div>
            </div>

            <a
              href={`${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}/api/auth/google`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[#4285F4] hover:bg-[#357ae8] text-white font-semibold transition-colors duration-300"
            >
              <FaGoogle /> Añadir cuenta de Google
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AddAccountModal;