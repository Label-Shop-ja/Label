import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import Footer from '../../components/Common/Footer';
import { PackageCheck, TrendingUp, ShoppingCart, BarChart3, Users, ShieldCheck, ArrowDown, ArrowUp, Loader2, Zap } from 'lucide-react';
import WelcomeHeader from '../../components/Public/WelcomeHeader';
import { useTheme } from '../../context/ThemeContext';

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

// Datos para los beneficios, para mantener el JSX limpio
const benefitsData = [
  {
    id: 1,
    icon: PackageCheck,
    title: "Control Total de Inventario",
    shortDescription: "Visión clara de cada producto en tiempo real.",
    longDescription: "Desde la materia prima hasta el producto final, con variantes y SKUs. Registra entradas, salidas y ajustes de stock con precisión. Nuestro sistema te alerta cuando los niveles están bajos para que nunca pierdas una venta."
  },
  {
    id: 2,
    icon: TrendingUp,
    title: "Finanzas Claras",
    shortDescription: "Reportes automáticos de ingresos y gastos.",
    longDescription: "Conecta tus ventas y compras para tener un panorama financiero en tiempo real. Genera reportes de ganancias, pérdidas y flujo de caja con un solo clic. Simplifica tu contabilidad y toma decisiones basadas en números reales."
  },
  {
    id: 3,
    icon: ShoppingCart,
    title: "Punto de Venta Integrado",
    shortDescription: "POS rápido que actualiza tu inventario al instante.",
    longDescription: "Un sistema de Punto de Venta (POS) intuitivo y veloz. Cada venta actualiza automáticamente tu inventario y tus registros financieros. Compatible con lectores de códigos de barras para agilizar el checkout."
  },
  {
    id: 4,
    icon: BarChart3,
    title: "Decisiones Basadas en Datos",
    shortDescription: "Análisis para optimizar tu estrategia de negocio.",
    longDescription: "Identifica tus productos más vendidos, tus clientes más leales y tus horas pico. Nuestras estadísticas te dan el poder de optimizar precios, promociones y estrategias de compra para maximizar tu rentabilidad."
  },
  {
    id: 5,
    icon: Users,
    title: "Gestión de Contactos",
    shortDescription: "Centraliza la información de clientes y proveedores.",
    longDescription: "Crea perfiles para tus clientes y proveedores. Lleva un historial de compras, deudas y pagos. Mejora la relación con tus contactos y agiliza la comunicación y la gestión de créditos."
  },
  {
    id: 6,
    icon: ShieldCheck,
    title: "Blindaje Anti-Devaluación",
    shortDescription: "Protege tu capital con precios actualizados a la tasa.",
    longDescription: "En economías volátiles, tu capital está en riesgo. Label ajusta los precios de venta de tus productos automáticamente basándose en la tasa de cambio actualizada, protegiendo tus márgenes de ganancia y asegurando que puedas reponer tu inventario sin pérdidas."
  }
];

const WelcomePage = ({ onOpenModal, onOpenLegalModal, isModalOpening }) => {
  // Refs para apuntar a las secciones de la página
  const topSectionRef = useRef(null);
  const bottomSectionRef = useRef(null);
  const { theme } = useTheme(); // Obtenemos el tema actual

  // Estado para controlar qué beneficio está expandido
  const [expandedBenefit, setExpandedBenefit] = useState(null);

  // Manejador para expandir/contraer un beneficio
  const handleBenefitClick = (id) => {
    // Si se hace clic en el mismo, se cierra (null). Si no, se abre el nuevo.
    setExpandedBenefit(expandedBenefit === id ? null : id);
  };

  // Funciones para manejar el scroll suave
  const scrollToBottom = () => {
    // El comportamiento de scroll suave ahora es manejado por CSS (`scroll-smooth`)
    bottomSectionRef.current?.scrollIntoView();
  };
  const scrollToTop = () => {
    // El comportamiento de scroll suave ahora es manejado por CSS (`scroll-smooth`)
    topSectionRef.current?.scrollIntoView();
  };

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
  const particleOptions = useMemo(() => {
    const colors = {
      light: { particle: '#3B82F6', link: '#D1D5DB' }, // Azul primario, gris claro
      dark: { particle: '#3b82f6', link: '#4A5568' },  // Azul primario, gris oscuro
    };

    return {
      fullScreen: { enable: true, zIndex: 1 },
      background: {
        color: { value: 'transparent' },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: isModalOpening ? 'grab' : 'repulse', // Cambia el modo de interacción al cargar
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
          grab: {
            distance: 150,
          },
        },
      },
      particles: {
        color: {
          value: colors[theme]?.particle || colors.dark.particle,
        },
        links: {
          color: colors[theme]?.link || colors.dark.link,
          distance: 150,
          enable: true,
          opacity: isModalOpening ? 0.5 : 0.2, // Aumenta la opacidad de los enlaces
          width: 1,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce',
          },
          random: false,
          speed: isModalOpening ? 4 : 1, // Aumenta la velocidad de las partículas
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 50,
        },
        opacity: { value: 0.2 },
        shape: { type: 'circle' },
        size: { value: { min: 1, max: 3 } },
      },
      detectRetina: true,
    };
  }, [theme, isModalOpening]); // Añadimos isModalOpening a las dependencias

  return (
    <div className="relative w-full h-screen flex flex-col bg-background overflow-hidden transition-colors duration-300">
      <WelcomeHeader onOpenModal={onOpenModal} isModalOpening={isModalOpening} />

      {/* Contenedor principal que ocupa el espacio restante */}
      <main className="relative flex-1 overflow-y-auto hide-scrollbar scroll-smooth">
        {/* Partículas y fondo ahora son fijos para permanecer en su sitio durante el scroll */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={particleOptions}
          className="fixed inset-0 z-10"
        />

        {/* Fondo de imagen */}
        <div
          className="fixed inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(https://res.cloudinary.com/dnkr9tvtq/image/upload/w_1920,h_1080,c_fill,q_auto,f_auto/v1751596741/img2.wallspic.com-luz-graficos_vectoriales-azul-ilustracion-diseno-5000x5000_jjastz.jpg)`,
          }}
        ></div>
        {/* Overlay con degradado */}
        <div className="fixed inset-0 bg-gradient-to-r from-background via-background/70 to-transparent z-2"></div>

        {/* SECCIÓN 1: PANTALLA SUPERIOR */}
        <section ref={topSectionRef} className="relative z-20 w-full h-full flex flex-col justify-center items-center p-8">
          <motion.div
            className="w-full max-w-4xl text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="font-bold text-5xl md:text-7xl text-text-base drop-shadow-lg mb-4">
              Bienvenido a LABEL
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-text-muted mb-12 drop-shadow-lg max-w-3xl mx-auto">
              Tu centro de mando para una gestión de negocios inteligente. Menos tiempo administrando, más tiempo creciendo.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col items-center">
              <p className="text-lg text-text-muted mb-4">¿Listo para transformar tu negocio?</p>
              <motion.button
                onClick={onOpenModal}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/50 text-lg disabled:opacity-70 disabled:cursor-wait min-w-[350px]"
                whileHover={!isModalOpening ? { scale: 1.05 } : {}}
                whileTap={!isModalOpening ? { scale: 0.95 } : {}}
                disabled={isModalOpening}
              >
                {isModalOpening ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    <span>Abriendo...</span>
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Únete a Label y empieza a CRECER
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Botón para bajar */}
          <motion.button
            onClick={scrollToBottom}
            className="absolute bottom-10 left-0 right-0 mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-surface/20 backdrop-blur-sm border border-white/10 text-text-muted hover:bg-surface/40 hover:text-text-base transition-all duration-300 shadow-lg"
            aria-label="Ir a más información"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 1.5, type: 'spring' } }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown size={32} />
            </motion.div>
          </motion.button>
        </section>

        {/* SECCIÓN 2: PANTALLA INFERIOR (BENEFICIOS) */}
        <section ref={bottomSectionRef} className="relative z-20 w-full h-full flex flex-col justify-center items-center p-8 bg-background/50 backdrop-blur-sm">
          <motion.div 
            className="w-full max-w-5xl text-text-base"
            initial="hidden"
            whileInView="visible" // La animación se activa cuando la sección entra en la vista
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center mb-12 text-text-base">
              Todo lo que necesitas, en un solo lugar
            </motion.h2>
            
            {/* Beneficios */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefitsData.map((benefit) => (
                <motion.div
                  key={benefit.id}
                  layout // Prop mágica para animar cambios de tamaño
                  onClick={() => handleBenefitClick(benefit.id)}
                  className="cursor-pointer p-4 rounded-xl bg-surface/50 border border-surface-secondary hover:bg-surface/80 transition-all duration-300 overflow-hidden"
                >
                  <motion.div layout="position" className="flex items-start gap-4">
                    <motion.div
                      className="bg-primary/20 p-2 rounded-lg mt-1 flex-shrink-0"
                      animate={{ rotate: expandedBenefit === benefit.id ? 360 : 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <benefit.icon className="text-primary h-6 w-6" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg">{benefit.title}</h3>
                      <p className="text-text-muted text-sm">{benefit.shortDescription}</p>
                    </div>
                  </motion.div>
                  <AnimatePresence>
                    {expandedBenefit === benefit.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <p className="text-text-base text-base leading-relaxed border-t border-surface-secondary pt-4">
                          {benefit.longDescription}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Botón para subir */}
          <motion.button
            onClick={scrollToTop}
            className="absolute top-28 left-0 right-0 mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-surface/20 backdrop-blur-sm border border-white/10 text-text-muted hover:bg-surface/40 hover:text-text-base transition-all duration-300 shadow-lg z-40"
            aria-label="Volver arriba"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowUp size={32} />
            </motion.div>
          </motion.button>

          <div className="absolute bottom-0 w-full">
            <Footer onOpenLegalModal={onOpenLegalModal} />
          </div>
        </section>
      </main>
    </div>
  );
};

WelcomePage.propTypes = {
  onOpenModal: PropTypes.func.isRequired,
  onOpenLegalModal: PropTypes.func.isRequired,
  isModalOpening: PropTypes.bool.isRequired,
};

export default WelcomePage;