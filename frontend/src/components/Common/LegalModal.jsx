import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LegalModal = ({ isOpen, onClose, title, children, isLoading }) => {
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 20 } },
    exit: { y: 50, opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal lo cierre
          >
            <div className="p-4 border-b border-surface-secondary flex justify-between items-center">
              <h2 className="text-xl font-bold text-text-base">{title}</h2>
              <button onClick={onClose} className="text-text-muted hover:text-text-base text-2xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto text-text-muted markdown-content">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-primary"></div>
                </div>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {children}
                </ReactMarkdown>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

LegalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.string.isRequired, // Ahora es un string de Markdown
  isLoading: PropTypes.bool,
};

export default LegalModal;