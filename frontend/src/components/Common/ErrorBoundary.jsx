import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = this.state.errorId;
    
    // Enhanced error logging
    const errorDetails = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('🚨 Production Error Caught:', errorDetails);
    
    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: true,
        custom_map: { errorId }
      });
    }
    
    // Store error details and call parent handler
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    };
    
    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => alert('Error details copied to clipboard'))
      .catch(() => console.log('Error details:', errorReport));
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.VITE_APP_ENV !== 'production';
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-deep-night-blue p-4">
          <div className="text-center max-w-md w-full">
            <div className="bg-surface rounded-lg p-8 shadow-xl border border-surface-secondary">
              <AlertTriangle className="mx-auto mb-4 text-red-500" size={64} />
              
              <h1 className="text-2xl font-bold text-white mb-4">
                Algo salió mal
              </h1>
              
              <p className="text-gray-300 mb-6">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado automáticamente.
              </p>
              
              {isDevelopment && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left">
                  <p className="text-red-400 text-sm font-mono mb-2">
                    Error ID: {this.state.errorId}
                  </p>
                  <p className="text-red-300 text-sm">
                    {this.state.error?.message}
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  <RefreshCw size={16} />
                  Recargar página
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  <Home size={16} />
                  Ir al inicio
                </button>
                
                {isDevelopment && (
                  <button
                    onClick={this.handleReportError}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg transition-colors font-medium text-sm"
                  >
                    <Bug size={16} />
                    Copiar detalles del error
                  </button>
                )}
              </div>
              
              <p className="text-gray-400 text-xs mt-6">
                Error ID: {this.state.errorId}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;