// C:\Proyectos\Label\frontend\src\pages\LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Importa el hook de autenticación
import { useNavigate, Link } from 'react-router-dom'; // Para navegación y enlaces

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Para mostrar mensajes de error al usuario
  const { login, loading } = useAuth(); // Accede a la función login y al estado de carga del contexto
  const navigate = useNavigate(); // Hook para la navegación programática

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setError(''); // Limpia cualquier error anterior

    try {
      // Llama a la función de login del contexto de autenticación
      await login(email, password);
      // Si el login es exitoso, redirige al usuario al dashboard
      navigate('/dashboard');
    } catch (err) {
      // Si hay un error (ej. credenciales inválidas), actualiza el estado de error
      console.error("Login failed:", err); // Para depuración
      setError(err || 'Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
        {/* Muestra el mensaje de error si existe */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {/* Muestra un mensaje de carga si la autenticación está en progreso */}
        {loading && <p className="text-blue-500 text-center mb-4">Iniciando sesión...</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading} // Deshabilita el input mientras carga
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading} // Deshabilita el input mientras carga
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={loading} // Deshabilita el botón mientras carga
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-600 text-sm mt-4">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-800">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;