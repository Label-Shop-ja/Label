// C:\Proyectos\Label\frontend\src\components\AccessModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Importa tu hook de autenticación
import { useNavigate } from 'react-router-dom'; // Para redireccionar

const AccessModal = ({ onClose }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Alterna entre Login y Register
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Para mostrar errores al usuario
  const { login, register, loading } = useAuth(); // Obtiene las funciones y el estado de carga del contexto
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos

    try {
      if (isRegisterMode) {
        // Lógica de registro
        await register({ fullName, email, password });
        console.log('Registro exitoso! Redirigiendo...');
      } else {
        // Lógica de login
        await login(email, password);
        console.log('Login exitoso! Redirigiendo...');
      }
      onClose(); // Cierra el modal al éxito
      navigate('/dashboard'); // Redirige al dashboard
    } catch (err) {
      // Manejo de errores desde el backend o Axios
      const errorMessage = err.response?.data?.message || err.message || 'Ocurrió un error inesperado.';
      setError(errorMessage);
      console.error("Error en autenticación:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-deep-night-blue to-dark-slate-gray p-8 rounded-lg shadow-2xl w-full max-w-md border border-action-blue relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-light hover:text-copper-rose-accent text-xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-center mb-6 text-copper-rose-accent">
          {isRegisterMode ? 'Registrarse' : 'Iniciar Sesión'}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading && <p className="text-action-blue text-center mb-4">Procesando...</p>}

        <form onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div className="mb-4">
              <label className="block text-neutral-light text-sm font-bold mb-2" htmlFor="fullName">
                Nombre Completo
              </label>
              <input
                type="text"
                id="fullName"
                className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                placeholder="Tu Nombre Completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isRegisterMode} // 'fullName' es requerido solo en modo registro
                disabled={loading} // Deshabilita el input mientras carga
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-neutral-light text-sm font-bold mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading} // Deshabilita el input mientras carga
            />
          </div>
          <div className="mb-6">
            <label className="block text-neutral-light text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading} // Deshabilita el input mientras carga
            />
          </div>
          <div className="flex items-center justify-between flex-col">
            <button
              type="submit"
              className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-3 px-6 rounded-full text-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 w-full mb-4"
              disabled={loading} // Deshabilita el botón mientras carga
            >
              {loading ? 'Procesando...' : (isRegisterMode ? 'Registrarse' : 'Iniciar Sesión')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode); // Alterna el modo
                setError(''); // Limpiar errores al cambiar de modo
                setEmail(''); // Opcional: limpiar campos al cambiar de modo
                setPassword('');
                setFullName('');
              }}
              className="text-neutral-light text-sm hover:text-copper-rose-accent transition duration-200"
              disabled={loading}
            >
              {isRegisterMode
                ? '¿Ya tienes una cuenta? Iniciar Sesión'
                : '¿No tienes una cuenta? Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessModal;