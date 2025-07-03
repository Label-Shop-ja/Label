import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import Footer from '../../components/Common/Footer'; // 1. Importamos el nuevo Footer

// 1. Definimos las "variantes" de animación para orquestar la entrada.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }, // Los hijos se animarán con 0.2s de diferencia
  },
};

const itemVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const WelcomePage = ({ onOpenModal, onOpenLegalModal }) => {
  // 2. Funciones necesarias para inicializar el motor de partículas
  const particlesInit = useCallback(async (engine) => {
    // Puedes inicializar instancias de tsParticles (engine) aquí, añadiendo formas personalizadas o presets
    // Esta línea carga el paquete `tsparticles-slim`
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    // Puedes hacer algo con el contenedor de partículas aquí
  }, []);

  // 3. Configuración para un efecto de partículas sutil y elegante
  const particleOptions = {
    background: {
      color: {
        value: 'transparent', // El fondo de las partículas es transparente
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'repulse',
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: '#3B82F6', // Color de las partículas (action-blue)
      },
      links: {
        color: '#4A5568', // Color de las líneas (neutral-gray-700)
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce',
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 50, // Número reducido de partículas
      },
      opacity: {
        value: 0.2,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center p-4">
      {/* 4. Componente de Partículas en el fondo */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particleOptions}
        className="absolute inset-0 z-0" // z-index bajo para que esté detrás de todo
      />

      {/* Fondo de imagen */}
      <div
        className="absolute inset-0 bg-cover bg-center z-10" // z-index intermedio
        style={{ backgroundImage: `url(https://i.imgur.com/DhYqN9x.png)` }}
      ></div>
      {/* Overlay con degradado */}
      <div className="absolute inset-0 bg-gradient-to-r from-deep-night-blue via-deep-night-blue/70 to-transparent z-10"></div>

      {/* Contenedor principal del contenido */}
      <motion.div
        className="relative z-20 w-full max-w-7xl h-[calc(100vh-2rem)] flex flex-col justify-center items-start p-8 md:p-12 lg:p-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Contenido de texto */}
        <div className="w-full max-w-lg lg:max-w-2xl text-white mb-8">
          <motion.h1
            className="font-bold text-5xl md:text-6xl text-white drop-shadow-lg mb-4 font-['Inter']"
            variants={itemVariants}
          >
            LABEL
          </motion.h1>
          <motion.h2
            className="text-3xl md:text-4xl font-semibold mb-4 leading-tight drop-shadow-lg"
            variants={itemVariants}
          >
            Gestiona tu negocio con inteligencia y eficiencia.
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl drop-shadow-lg"
            variants={itemVariants}
          >
            Label es la plataforma integral que te permite tomar el control total de tus operaciones,
            optimizar recursos y escalar con éxito. Simplifica tu gestión, potencia tu crecimiento.
          </motion.p>
        </div>

        {/* Botón de Acceder */}
        <motion.div
          className="w-full flex justify-end pr-8 md:pr-16 lg:pr-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }} // El botón aparece al final
        >
          <motion.button
            onClick={onOpenModal}
            className="bg-action-blue hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-opacity-50 text-xl md:text-2xl w-fit"
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 12px rgba(59, 130, 246, 0.8)' }}
            whileTap={{ scale: 0.95 }}
          >
            Acceder
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 5. Renderizamos el Footer */}
      <Footer onOpenLegalModal={onOpenLegalModal} />
    </div>
  );
};

WelcomePage.propTypes = {
  onOpenModal: PropTypes.func.isRequired,
  onOpenLegalModal: PropTypes.func.isRequired,
};

export default WelcomePage;