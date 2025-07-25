import React from 'react';
import { motion } from 'framer-motion';
import { FaGoogle } from 'react-icons/fa';
import AccountManager from '../../services/AccountManager';

function GoogleAccountSelector({ onUseAccount, onUseDifferent, onClose }) {
  const savedAccounts = AccountManager.getSavedAccounts();
  const googleAccounts = savedAccounts.accounts.filter(acc => acc.provider === 'google');
  const lastUsedGoogle = googleAccounts.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-surface rounded-lg p-6 mx-4 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <FaGoogle className="text-[#4285F4] text-3xl mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-text-base">Elegir cuenta</h3>
          <p className="text-sm text-text-muted">¿Con qué cuenta quieres continuar?</p>
        </div>

        {lastUsedGoogle && (
          <button
            onClick={() => onUseAccount(lastUsedGoogle)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors mb-3 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#4285F4] flex items-center justify-center text-white font-bold text-sm">
              {lastUsedGoogle.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-base truncate">{lastUsedGoogle.fullName}</p>
              <p className="text-sm text-text-muted truncate">{lastUsedGoogle.email}</p>
            </div>
            <div className="text-xs px-2 py-1 rounded bg-[#4285F4] text-white">G</div>
          </button>
        )}

        <button
          onClick={onUseDifferent}
          className="w-full p-3 rounded-lg border border-surface-secondary hover:bg-surface-secondary transition-colors text-text-base"
        >
          Usar otra cuenta
        </button>
      </motion.div>
    </motion.div>
  );
}

export default GoogleAccountSelector;