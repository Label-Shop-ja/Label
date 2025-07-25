import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../../redux/authSlice'; // Necesitaremos crear esta acción

const profileSchema = yup.object().shape({
  fullName: yup.string().required('El nombre completo es requerido.'),
});

const ProfilePage = () => {
  const { user, isLoading } = useAuth();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
    },
  });

  // Actualiza el formulario si los datos del usuario cambian en Redux
  useEffect(() => {
    if (user) {
      reset({ fullName: user.fullName });
    }
  }, [user, reset]);

  const onSubmit = (data) => {
    dispatch(updateUserProfile(data))
      .unwrap()
      .then(() => {
        showNotification('Perfil actualizado con éxito', 'success');
      })
      .catch((error) => {
        showNotification(error.message || 'Error al actualizar el perfil', 'error');
      });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-base mb-6">Mi Perfil</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-text-muted mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            id="fullName"
            {...register('fullName')}
            className="w-full p-3 bg-surface rounded-md border border-surface-secondary text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.fullName && <p className="mt-2 text-error-red text-sm">{errors.fullName.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            value={user?.email || ''}
            disabled
            className="w-full p-3 bg-surface-secondary rounded-md border border-surface-secondary text-text-muted cursor-not-allowed"
          />
        </div>
        <button type="submit" disabled={!isDirty || isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-primary/90 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;