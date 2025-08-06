import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpinnerRing } from './LoadingStates';

const ModernLoader = ({ message = "Cargando aplicación..." }) => {
  const [showEmergencyButton, setShowEmergencyButton] = useState(false);
  const [dots, setDots] = useState('');
  const [currentTip, setCurrentTip] = useState(0);
  
  const loadingTips = [
    "Verificando credenciales de acceso...",
    "Conectando con el servidor...",
    "Cargando configuración de usuario...",
    "Inicializando componentes...",
    "Preparando interfaz..."
  ];

  // Mostrar botón de emergencia después de 12 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEmergencyButton(true);
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  // Animación de puntos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);
  
  // Cambiar tips de carga
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % loadingTips.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [loadingTips.length]);

  const handleEmergencyReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo/Título */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Label</h1>
          <p className="text-blue-200 text-lg">Gestión Empresarial Inteligente</p>
        </motion.div>

        {/* Spinner moderno */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative flex items-center justify-center"
        >
          <SpinnerRing size="lg" color="blue" />
          
          {/* Efecto de brillo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
        </motion.div>

        {/* Mensaje de carga */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-white text-lg font-medium">
            {message}{dots}
          </p>
          <div className="mt-4 w-80 h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-full animate-gradient-x"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
          <motion.p 
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-slate-300 text-sm mt-2 h-5"
          >
            {loadingTips[currentTip]}
          </motion.p>
        </motion.div>

        {/* Botón de emergencia */}
        <AnimatePresence>
          {showEmergencyButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-3"
            >
              <p className="text-yellow-300 text-sm">
                ⚠️ La carga está tomando más tiempo del esperado
              </p>
              <button
                onClick={handleEmergencyReset}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                🔄 Limpiar y Reiniciar
              </button>
              <p className="text-slate-400 text-xs max-w-xs">
                Esto limpiará todos los datos almacenados y reiniciará la aplicación
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 10,
            }}
            animate={{
              y: -10,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ModernLoader;