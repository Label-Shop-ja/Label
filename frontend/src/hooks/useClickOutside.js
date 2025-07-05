import { useEffect, useRef } from 'react';

/**
 * Hook que detecta clics fuera de un elemento referenciado.
 * @param {function} handler - La función a ejecutar cuando se hace clic afuera.
 * @returns {object} - La referencia para asignar al elemento del DOM.
 */
function useClickOutside(handler) {
  const domNode = useRef();

  useEffect(() => {
    const maybeHandler = (event) => {
      if (domNode.current && !domNode.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', maybeHandler);

    return () => {
      document.removeEventListener('mousedown', maybeHandler);
    };
  }, [handler]);

  return domNode;
}

export default useClickOutside;
