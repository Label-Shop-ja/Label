import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import Footer from '../../components/Common/Footer';
import { PackageCheck, TrendingUp, ShoppingCart, BarChart3 } from 'lucide-react';
import WelcomeHeader from '../../components/Public/WelcomeHeader'; // 1. Importamos el nuevo Header

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
    <div className="relative w-full h-screen flex flex-col">
      {/* 2. Añadimos el nuevo Header */}
      <WelcomeHeader onOpenModal={onOpenModal} />

      {/* Contenedor principal que ocupa el espacio restante */}
      <main className="relative flex-1 overflow-y-auto">
        {/* 4. Componente de Partículas en el fondo */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={particleOptions}
          className="absolute inset-0 z-10" // Partículas sobre la imagen
        />

        {/* Fondo de imagen */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0" // Imagen al fondo
          style={{
            backgroundImage: `url(https://res.cloudinary.com/dnkr9tvtq/image/upload/v1751596741/img2.wallspic.com-luz-graficos_vectoriales-azul-ilustracion-diseno-5000x5000_jjastz.jpg)`,
          }}
        ></div>
        {/* Overlay con degradado */}
        <div className="absolute inset-0 bg-gradient-to-r from-deep-night-blue via-deep-night-blue/70 to-transparent z-0"></div>

        {/* Contenedor principal del contenido */}
        <motion.div
          className="relative z-20 w-full h-full flex flex-col justify-center p-8 md:p-12 lg:p-16" // Se quita items-start para permitir que los hijos se estiren
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Contenido de texto */}
          <div className="w-full max-w-3xl lg:max-w-4xl text-white"> {/* Este div agrupa el contenido principal */}
            <motion.h1 variants={itemVariants} className="font-bold text-5xl md:text-7xl text-white drop-shadow-lg mb-4">
              Bienvenido a LABEL
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-text-muted mb-12 drop-shadow-lg max-w-3xl">
              Tu centro de mando para una gestión de negocios inteligente. Menos tiempo administrando, más tiempo creciendo.
            </motion.p>

            {/* Beneficios */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-12">
              {/* Benefit 1 */}
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-2 rounded-lg mt-1">
                  <PackageCheck className="text-primary h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Control Total de Inventario</h3>
                  <p className="text-text-muted text-sm">Desde el stock hasta las variantes, ten una visión clara de cada producto en tiempo real.</p>
                </div>
              </div>
              {/* Benefit 2 */}
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-2 rounded-lg mt-1">
                  <TrendingUp className="text-primary h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Finanzas Claras</h3>
                  <p className="text-text-muted text-sm">Registra ingresos, gastos y visualiza la salud de tu negocio con reportes automáticos.</p>
                </div>
              </div>
              {/* Benefit 3 */}
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-2 rounded-lg mt-1">
                  <ShoppingCart className="text-primary h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Punto de Venta Integrado</h3>
                  <p className="text-text-muted text-sm">Agiliza tus ventas con un POS rápido e intuitivo que actualiza tu inventario al instante.</p>
                </div>
              </div>
              {/* Benefit 4 */}
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-2 rounded-lg mt-1">
                  <BarChart3 className="text-primary h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Decisiones Basadas en Datos</h3>
                  <p className="text-text-muted text-sm">Utiliza estadísticas y análisis para identificar oportunidades y optimizar tu estrategia.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Call to Action - Ahora es hermano del contenido para alinearse con el contenedor padre */}
          <motion.div variants={itemVariants} className="w-full text-center mt-8"> {/* mt-auto lo empuja hacia abajo */}
              <p className="text-lg text-text-muted mb-4">¿Listo para transformar tu Negocio?</p>
              <motion.button
                onClick={onOpenModal}
                className="bg-gradient-to-r from-action-blue to-copper-rose-accent text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-action-blue/40 focus:outline-none focus:ring-4 focus:ring-action-blue/50 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Únete a Label y empieza a CRECER
              </motion.button>
            </motion.div>
        </motion.div>
      </main>

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