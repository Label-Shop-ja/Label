import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';

const WelcomeHeader = ({ onOpenModal, isModalOpening }) => {
  return (
    <motion.header
      className="relative z-30 flex items-center justify-between p-4 bg-black/75 backdrop-blur-lg border border-white/10 shadow-2xl shadow-black/40 rounded-2xl mx-4 mt-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-3">
        <img
          src="https://res.cloudinary.com/dnkr9tvtq/image/upload/v1751604992/Gemini_Generated_Image_t1q1t8t1q1t8t1q1_xmbwgc_c_crop_w_600_h_800_c9nu4e.png"
          alt="Label Logo"
          className="h-12 w-auto"
        />
        <span className="text-2xl font-bold text-primary">
          LABEL
        </span>
      </div>
      <button
        onClick={onOpenModal}
        className="flex items-center justify-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70 disabled:cursor-wait w-32"
        disabled={isModalOpening}
      >
        {isModalOpening ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <LogIn size={18} />
        )}
        <span>{isModalOpening ? 'Abriendo...' : 'Acceder'}</span>
      </button>
    </motion.header>
  );
};

WelcomeHeader.propTypes = {
  onOpenModal: PropTypes.func.isRequired,
  isModalOpening: PropTypes.bool.isRequired,
};

export default WelcomeHeader;