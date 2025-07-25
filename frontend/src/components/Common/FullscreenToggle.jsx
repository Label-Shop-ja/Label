// C:\Proyectos\Label\frontend\src\components\Common\FullscreenToggle.jsx
import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

function FullscreenToggle() {
    // 1. Estado para saber si estamos en pantalla completa o no.
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    // 2. Función que se ejecuta cuando cambia el estado de la pantalla completa (ej. al presionar ESC).
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    // 3. Efecto para escuchar los cambios de pantalla completa del navegador.
    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Limpiamos el listener cuando el componente se desmonta para evitar fugas de memoria.
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // 4. Función para activar/desactivar la pantalla completa.
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error al intentar entrar en pantalla completa: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full text-text-muted hover:bg-surface-secondary hover:text-text-base transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Entrar en pantalla completa'}
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Entrar en pantalla completa'}
        >
            {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
        </button>
    );
}

export default FullscreenToggle;