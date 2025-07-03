import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';

const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text-base">
    <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-t-transparent border-primary"></div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Muestra un spinner mientras se verifica el estado de autenticación al cargar la app.
    // Esto evita un parpadeo a la página de login.
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // 1. Si el usuario no está autenticado, siempre se redirige a la página de inicio.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Si la ruta requiere roles específicos y el usuario no tiene el rol adecuado...
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // ...redirige a una página de "No Autorizado".
    // `replace` evita que el usuario pueda volver a la página no autorizada con el botón "atrás".
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // 3. Si el usuario está autenticado y tiene el rol correcto (o la ruta no requiere un rol),
  // renderiza el componente hijo (ej. el Dashboard o el Panel de Admin).
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

ProtectedRoute.defaultProps = {
  allowedRoles: [],
};

export default ProtectedRoute;