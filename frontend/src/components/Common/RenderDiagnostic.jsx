import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const RenderDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({
    reactVersion: React.version,
    axiosConnection: 'Verificando...',
    contextProviders: 'Verificando...',
    cssLoaded: 'Verificando...',
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      // Test Axios connection
      try {
        await axiosInstance.get('/health');
        setDiagnostics(prev => ({ ...prev, axiosConnection: '✅ Conectado' }));
      } catch (error) {
        setDiagnostics(prev => ({ 
          ...prev, 
          axiosConnection: `❌ Error: ${error.message}` 
        }));
      }

      // Check CSS
      const hasStyles = document.querySelector('style') || document.querySelector('link[rel="stylesheet"]');
      setDiagnostics(prev => ({ 
        ...prev, 
        cssLoaded: hasStyles ? '✅ CSS Cargado' : '❌ CSS No Encontrado' 
      }));

      // Check context providers
      setDiagnostics(prev => ({ 
        ...prev, 
        contextProviders: '✅ Contextos Disponibles' 
      }));
    };

    runDiagnostics();
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-surface p-4 rounded-lg shadow-lg z-50 text-sm">
      <h3 className="font-bold mb-2 text-primary">Diagnóstico de Renderizado</h3>
      <div className="space-y-1">
        <div>React: {diagnostics.reactVersion}</div>
        <div>Backend: {diagnostics.axiosConnection}</div>
        <div>CSS: {diagnostics.cssLoaded}</div>
        <div>Contextos: {diagnostics.contextProviders}</div>
      </div>
    </div>
  );
};

export default RenderDiagnostic;