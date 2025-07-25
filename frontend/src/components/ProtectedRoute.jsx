import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // Asumiendo que este hook ya existe

/**
 * Un componente de ruta protegida que verifica la autenticación y, opcionalmente, los roles de usuario.
 * @param {Object} props
 * @param {string[]} [props.allowedRoles] - Un array de roles permitidos. Si no se proporciona, solo se verifica la autenticación.
 * @param {React.ReactNode} [props.children] - Componentes hijos para renderizar si la ruta no usa un <Outlet>.
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    // Mientras se verifica el estado de autenticación, es mejor no renderizar nada o mostrar un loader.
    if (isLoading) {
        return null; // O un componente de Spinner global
    }

    // 1. Si el usuario NO está autenticado, redirigirlo a la página de inicio.
    //    Guardamos la ubicación a la que intentaba ir para poder redirigirlo allí después del login.
    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // 2. Si se requieren roles y el rol del usuario NO está en la lista de roles permitidos.
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // El usuario está logueado pero no tiene permiso. Lo enviamos a la página de "No Autorizado".
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. Si el usuario está autenticado y tiene el rol correcto, renderizar el contenido.
    return children ? children : <Outlet />;
};

export default ProtectedRoute;