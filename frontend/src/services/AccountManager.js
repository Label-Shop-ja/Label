class AccountManager {
  static STORAGE_KEY = 'savedAccounts';
  static EXPIRY_DAYS = 7;

  // Obtener todas las cuentas guardadas
  static getSavedAccounts() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : { accounts: [], activeAccountId: null };
    } catch (error) {
      console.error('Error loading saved accounts:', error);
      return { accounts: [], activeAccountId: null };
    }
  }

  // Guardar cuenta después del login
  static saveAccount(user, accessToken, provider = 'local') {
    const savedData = this.getSavedAccounts();
    const existingIndex = savedData.accounts.findIndex(acc => acc.id === user.id);
    
    const accountData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      provider,
      avatar: user.avatar || null,
      refreshToken: provider === 'google' ? user.refreshToken : null,
      lastUsed: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      // Actualizar cuenta existente
      savedData.accounts[existingIndex] = accountData;
    } else {
      // Agregar nueva cuenta
      savedData.accounts.push(accountData);
    }

    savedData.activeAccountId = user.id;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedData));
    this.cleanExpiredAccounts();
  }

  // Limpiar cuentas no usadas en 1 semana
  static cleanExpiredAccounts() {
    const savedData = this.getSavedAccounts();
    const oneWeekAgo = new Date(Date.now() - (this.EXPIRY_DAYS * 24 * 60 * 60 * 1000));
    
    const activeAccounts = savedData.accounts.filter(account => 
      new Date(account.lastUsed) > oneWeekAgo
    );

    if (activeAccounts.length !== savedData.accounts.length) {
      savedData.accounts = activeAccounts;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedData));
    }
  }

  // Obtener cuenta por ID
  static getAccountById(accountId) {
    const savedData = this.getSavedAccounts();
    return savedData.accounts.find(acc => acc.id === accountId);
  }

  // Actualizar última vez usado
  static updateLastUsed(accountId) {
    const savedData = this.getSavedAccounts();
    const account = savedData.accounts.find(acc => acc.id === accountId);
    
    if (account) {
      account.lastUsed = new Date().toISOString();
      savedData.activeAccountId = accountId;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedData));
    }
  }

  // Remover cuenta específica
  static removeAccount(accountId) {
    const savedData = this.getSavedAccounts();
    savedData.accounts = savedData.accounts.filter(acc => acc.id !== accountId);
    
    if (savedData.activeAccountId === accountId) {
      savedData.activeAccountId = savedData.accounts.length > 0 ? savedData.accounts[0].id : null;
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedData));
  }

  // Limpiar todas las cuentas
  static clearAllAccounts() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export default AccountManager;