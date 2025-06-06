// C:\Proyectos\Label\frontend\src\components\ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de Ruta Protegida.
 * Este componente se encarga de verificar si un usuario está autenticado.
 * Si el usuario no está autenticado, lo redirige a la página de inicio de sesión.
 * De lo contrario, permite el renderizado de los componentes hijos (rutas anidadas).
 *
 * @param {object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que se renderizarán si el usuario está autenticado.
 * @param {boolean} props.redirectToLogin - Indica si debe redirigir a la página de login si no está autenticado.
 * Por defecto es true. Si es false, redirigirá a la raíz.
 */
const ProtectedRoute = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, loading } = useAuth(); // Obtiene el estado de autenticación y carga del contexto

  // Si la aplicación está cargando el estado de autenticación (ej. verificando token en localStorage),
  // no hacemos nada, simplemente esperamos. Se mostrará el spinner de carga en App.jsx.
  if (loading) {
    return null; // O podrías retornar un spinner aquí si no lo manejas globalmente en App.jsx
  }

  // Si el usuario no está autenticado, redirigimos a la ruta especificada (por defecto, la raíz o login)
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si el usuario está autenticado, renderizamos los componentes hijos.
  // 'children' se usa si la ruta protegida envuelve directamente los elementos.
  // 'Outlet' se usa si la ruta protegida es un layout y tiene rutas anidadas.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;