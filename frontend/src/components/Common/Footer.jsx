import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const Footer = ({ onOpenLegalModal }) => {
  return (
    <motion.footer
      className="absolute bottom-0 left-0 w-full p-4 flex justify-center items-center z-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
    >
      <div className="text-sm text-neutral-gray space-x-4">
        <button
          onClick={() => onOpenLegalModal('terms')}
          className="hover:text-action-blue transition-colors duration-200"
        >
          Términos de Servicio
        </button>
        <span>|</span>
        <button
          onClick={() => onOpenLegalModal('privacy')}
          className="hover:text-action-blue transition-colors duration-200"
        >
          Política de Privacidad
        </button>
      </div>
    </motion.footer>
  );
};

Footer.propTypes = {
  onOpenLegalModal: PropTypes.func.isRequired,
};

export default Footer;