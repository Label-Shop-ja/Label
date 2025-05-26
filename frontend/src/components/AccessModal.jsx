// C:\Proyectos\Label\frontend\src\components\AccessModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // <-- Importa useAuth

function AccessModal({ onClose }) { // Ya no recibe onLoginSuccess
  const [view, setView] = useState('initial');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  const [fullName, setFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState(''); // Corregido: setRegPassoword -> setRegPassword
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);

  // Consumimos las funciones de login y register del contexto
  const { login, register } = useAuth();

  const resetLoginStates = () => {
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setIsLoadingLogin(false);
  };

  const resetRegisterStates = () => {
    setFullName('');
    setRegUsername('');
    setRegEmail('');
    setRegPassword(''); // Usar setRegPassword
    setConfirmPassword('');
    setRegisterError('');
    setIsLoadingRegister(false);
  };

  const handleLoginClick = () => {
    setView('login');
    resetRegisterStates();
  };

  const handleRegisterClick = () => {
    setView('register');
    resetLoginStates();
  };

  const handleBackClick = () => {
    setView('initial');
    resetLoginStates();
    resetRegisterStates();
  };

  // Función para manejar el envío del formulario de inicio de sesión
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoadingLogin(true);

    if (!loginEmail || !loginPassword) {
      setLoginError('Por favor, ingresa tu correo/usuario y contraseña.');
      setIsLoadingLogin(false);
      return;
    }

    try {
      // Ahora llamamos a la función login del contexto
      await login(loginEmail, loginPassword);
      alert('¡Inicio de sesión exitoso! (Gestionado por AuthContext)');
      onClose(); // Cierra el modal solo después de un login exitoso
    } catch (error) {
      setLoginError(error); // El error viene directamente del AuthContext
    } finally {
      setIsLoadingLogin(false);
    }
  };

  // Función para manejar el envío del formulario de registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setIsLoadingRegister(true);

    // Validaciones básicas del formulario de registro
    if (!fullName || !regUsername || !regEmail || !regPassword || !confirmPassword) {
      setRegisterError('Todos los campos son obligatorios.');
      setIsLoadingRegister(false);
      return;
    }

    if (regPassword !== confirmPassword) {
      setRegisterError('Las contraseñas no coinciden.');
      setIsLoadingRegister(false);
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setRegisterError('Por favor, ingresa un formato de correo electrónico válido.');
      setIsLoadingRegister(false);
      return;
    }

    if (regPassword.length < 6) {
      setRegisterError('La contraseña debe tener al menos 6 caracteres.');
      setIsLoadingRegister(false);
      return;
    }

    try {
      // Ahora llamamos a la función register del contexto
      // Nueva línea en AccessModal.jsx
await register({
  fullName,
  username: regUsername, // <-- Mapeamos regUsername a username
  email: regEmail,       // <-- Mapeamos regEmail a email
  password: regPassword
});
      alert(`¡Registro exitoso para ${fullName}! (Gestionado por AuthContext)`);
      onClose(); // Cierra el modal solo después de un registro exitoso
    } catch (error) {
      setRegisterError(error); // El error viene directamente del AuthContext
    } finally {
      setIsLoadingRegister(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-deep-night-blue rounded-lg shadow-xl p-8 w-full max-w-md transform transition-all duration-300 ease-out relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-light hover:text-copper-rose-accent text-2xl"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        {view === 'initial' && (
          <div className="flex flex-col space-y-4 animate-slideInFromTop">
            <h2 className="text-3xl font-bold text-center mb-6 text-neutral-light">Acceder a Label</h2>
            <button
              onClick={handleLoginClick}
              className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-3 px-6 rounded-lg text-xl transition duration-300 transform hover:scale-105"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={handleRegisterClick}
              className="bg-neutral-gray hover:bg-gray-700 text-neutral-light font-bold py-3 px-6 rounded-lg text-xl transition duration-300 transform hover:scale-105"
            >
              Registrarse
            </button>
          </div>
        )}

        {view === 'login' && (
          <div className="animate-slideInFromRight">
            <h2 className="text-3xl font-bold text-center mb-6 text-neutral-light">Iniciar Sesión</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <p className="text-error-red text-center text-sm mb-4">{loginError}</p>
              )}
              <div>
                <label htmlFor="emailOrUser" className="block text-neutral-light text-lg font-medium mb-2">
                  Correo Electrónico o Usuario
                </label>
                <input
                  type="text"
                  id="emailOrUser"
                  className="w-full p-3 rounded-lg bg-gray-700 text-neutral-light border border-gray-600 focus:outline-none focus:ring-2 focus:ring-action-blue"
                  placeholder="tu.correo@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-neutral-light text-lg font-medium mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full p-3 rounded-lg bg-gray-700 text-neutral-light border border-gray-600 focus:outline-none focus:ring-2 focus:ring-action-blue"
                  placeholder="********"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-success-green hover:bg-green-700 text-neutral-light font-bold py-3 px-6 rounded-lg text-xl transition duration-300 transform hover:scale-105"
                disabled={isLoadingLogin}
              >
                {isLoadingLogin ? 'Cargando...' : 'Entrar'}
              </button>
              <a href="#" className="block text-center text-action-blue hover:underline mt-4">
                ¿Olvidaste tu contraseña?
              </a>
            </form>
            <button
              onClick={handleBackClick}
              className="mt-6 w-full text-neutral-gray hover:text-neutral-light transition-colors duration-200 text-lg"
            >
              &larr; Volver
            </button>
          </div>
        )}

        {view === 'register' && (
          <div className="animate-slideInFromLeft">
            <h2 className="text-3xl font-bold text-center mb-6 text-neutral-light">Registrarse en Label</h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {registerError && (
                <p className="text-error-red text-center text-sm mb-4">{registerError}</p>
              )}
              <div>
                <label htmlFor="fullName" className="block text-neutral-light text-lg font-medium mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="fullName"
                  className="w-full p-3 rounded-lg bg-gray-700 text-neutral-light border border-gray-600 focus:outline-none focus:ring-2 focus:ring-action-blue"
                  placeholder="Jhosber Fermín"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="regUsername" className="block text-neutral-light text-lg font-medium mb-2">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  id="regUsername"
                  className="w-full p-3 rounded-lg bg-gray-700 text-neutral-light border border-gray-600 focus:outline-none focus:ring-2 focus:ring-action-blue"
                  placeholder="jhosber.dev"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="regEmail" className="block text-neutral-light text-lg font-medium mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="regEmail"
                  className="w-full p-3 rounded-lg bg-gray-700 text-neutral-light border border-gray-600 focus:outline-none focus:ring-2 focus:ring-action-blue"
                  placeholder="tu.correo@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="regPassword" className="block text-neutral-light text-lg font-medium mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="regPassword"
                  className="w-full p-3 rounded-lg bg-gray-700 text-neutral-light border border-gray-600 focus:outline-none focus:ring-2 focus:ring-action-blue"
                  placeholder="********"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-neutral-light text-lg font-medium mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full p-3 rounded-lg bg-gray-700 text-neutral-light border border-gray-600 focus:outline-none focus:ring-2 focus:ring-action-blue"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-copper-rose-accent hover:bg-yellow-700 text-deep-night-blue font-bold py-3 px-6 rounded-lg text-xl transition duration-300 transform hover:scale-105"
                disabled={isLoadingRegister}
              >
                {isLoadingRegister ? 'Creando Cuenta...' : 'Crear Cuenta'}
              </button>
              <p className="text-center text-sm text-neutral-gray mt-4">
                Al registrarte, aceptas nuestros{' '}
                <a href="#" className="text-action-blue hover:underline">
                  Términos y Condiciones
                </a>{' '}
                y nuestra{' '}
                <a href="#" className="text-action-blue hover:underline">
                  Política de Privacidad
                </a>.
              </p>
            </form>
            <button
              onClick={handleBackClick}
              className="mt-6 w-full text-neutral-gray hover:text-neutral-light transition-colors duration-200 text-lg"
            >
              &larr; Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessModal;