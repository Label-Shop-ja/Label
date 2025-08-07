// Update available notification component
import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UpdateAvailable = ({ isVisible, onUpdate, onDismiss }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 bg-primary text-white p-4 rounded-lg shadow-lg max-w-sm"
        >
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Actualización disponible</h4>
              <p className="text-sm opacity-90 mb-3">
                Una nueva versión de Label está disponible. Actualiza para obtener las últimas mejoras.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onUpdate}
                  className="bg-white text-primary px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Actualizar
                </button>
                <button
                  onClick={onDismiss}
                  className="text-white/80 hover:text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Más tarde
                </button>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-white/80 hover:text-white p-1 -mt-1 -mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateAvailable;