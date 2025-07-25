import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, LogOut } from 'lucide-react';
import AccountManager from '../../services/AccountManager';
import useAuth from '../../hooks/useAuth';

function AccountSwitcherModal({ isOpen, onClose, onAddAccount, onAccountChanged }) {
  const { user: currentUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const savedData = AccountManager.getSavedAccounts();

  const handleSwitchAccount = async (account) => {
    if (account.id === currentUser?.id) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      // Actualizar lastUsed de la cuenta seleccionada
      AccountManager.updateLastUsed(account.id);
      onAccountChanged?.(); // Notificar cambio
      
      if (account.provider === 'google') {
        // TODO: Implementar cambio de cuenta Google
        console.log('Switching to Google account:', account.email);
      } else {
        // TODO: Implementar cambio de cuenta local (pedir contraseña)
        console.log('Switching to local account:', account.email);
      }
    } catch (error) {
      console.error('Error switching account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAll = () => {
    AccountManager.clearAllAccounts();
    logout();
    onAccountChanged?.(); // Notificar cambio
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface rounded-lg shadow-xl w-full max-w-md mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-secondary">
            <h2 className="text-lg font-semibold text-text-base">Cambiar de cuenta</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-surface-secondary rounded-full transition-colors"
            >
              <X size={20} className="text-text-muted" />
            </button>
          </div>

          {/* Accounts List */}
          <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
            {savedData.accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => handleSwitchAccount(account)}
                disabled={isLoading}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors text-left disabled:opacity-50"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {account.fullName.charAt(0).toUpperCase()}
                </div>

                {/* Account Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {account.id === currentUser?.id && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    <p className="font-medium text-text-base truncate">
                      {account.fullName}
                    </p>
                  </div>
                  <p className="text-sm text-text-muted truncate">{account.email}</p>
                </div>

                {/* Provider Badge */}
                <div className="text-xs px-2 py-1 rounded bg-surface-secondary text-text-muted">
                  {account.provider === 'google' ? 'G' : '📧'}
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-surface-secondary space-y-2">
            <button
              onClick={onAddAccount}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors text-text-base"
            >
              <Plus size={20} />
              Añadir otra cuenta
            </button>
            
            <button
              onClick={handleLogoutAll}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors text-error"
            >
              <LogOut size={20} />
              Cerrar todas las sesiones
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AccountSwitcherModal;