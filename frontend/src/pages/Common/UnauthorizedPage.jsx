import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-deep-night-blue text-neutral-light text-center p-4">
      <h1 className="text-6xl font-bold text-error-red animate-pulse">403</h1>
      <h2 className="text-3xl font-semibold mt-4">Acceso Denegado</h2>
      <p className="mt-2 text-lg max-w-md">
        No tienes los permisos necesarios para acceder a este recurso. Si crees que esto es un error, por favor contacta al administrador.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 bg-action-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
      >
        Volver al Dashboard
      </Link>
    </div>
  );
};

export default UnauthorizedPage;