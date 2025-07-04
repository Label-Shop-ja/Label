import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const WelcomeHeader = ({ onOpenModal }) => {
  return (
    <motion.header
      className="relative z-20 flex items-center justify-between p-4 bg-gray-950 border-b border-gray-800 shadow-lg"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-3">
        <img src="https://res.cloudinary.com/dnkr9tvtq/image/upload/v1751604992/Gemini_Generated_Image_t1q1t8t1q1t8t1q1_xmbwgc_c_crop_w_600_h_800_c9nu4e.png" alt="Label Logo" className="h-14 w-12" />
        <span className="text-2xl font-bold text-primary">
          LABEL
        </span>
      </div>
      <motion.button
        onClick={onOpenModal}
        className="bg-gradient-to-r from-action-blue to-copper-rose-accent text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-action-blue/40 focus:outline-none focus:ring-4 focus:ring-action-blue/50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Acceder
      </motion.button>
    </motion.header>
  );
};

WelcomeHeader.propTypes = {
  onOpenModal: PropTypes.func.isRequired,
};

export default WelcomeHeader;