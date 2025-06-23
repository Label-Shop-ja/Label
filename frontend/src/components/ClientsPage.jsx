// C:\Proyectos\Label\frontend\src\components\ClientsPage.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import ErrorBoundary from './ErrorBoundary';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // --- Cargar clientes al montar el componente ---
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/clients'); // Asume que tu backend tiene /api/clients
        setClients(response.data);
        setError('');
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        const errorMessage = err.response?.data?.message || 'Error al cargar clientes';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []); // Se ejecuta solo una vez al montar

  // --- Manejar cambios en el formulario de nuevo cliente ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Manejar el envío del formulario de nuevo cliente ---
  const handleAddClient = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Validar campos requeridos antes de enviar
      if (!newClient.name) {
        setError('Por favor, ingresa el nombre del cliente.');
        return;
      }

      const response = await axiosInstance.post('/clients', newClient);
      setClients((prev) => [response.data, ...prev]); // Añadir el nuevo cliente al principio de la lista
      setNewClient({ // Limpiar el formulario
        name: '',
        email: '',
        phone: '',
        address: '',
      });
      setShowAddForm(false); // Ocultar el formulario después de agregar
      setError(''); // Limpiar cualquier error previo
    } catch (err) {
      console.error('Error al añadir cliente:', err);
      const errorMessage = err.response?.data?.message || 'Error al añadir cliente';
      setError(errorMessage);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6 bg-dark-slate-gray rounded-lg shadow-xl min-h-screen">
        <h2 className="text-4xl font-extrabold text-copper-rose-accent mb-8 border-b-2 border-action-blue pb-4">Gestión de Clientes</h2>

        {/* Loader global */}
        {loading && (
          <div className="flex justify-center items-center h-full">
            <p className="text-xl text-action-blue">Cargando clientes...</p>
          </div>
        )}

        {/* Mensaje de error destacado */}
        {error && (
          <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">¡Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {!loading && (
          <>
            <div className="mb-8">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-action-blue hover:bg-blue-700 text-neutral-light font-bold py-3 px-6 rounded-lg text-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
              >
                <FaUserPlus className="mr-2" /> {showAddForm ? 'Ocultar Formulario' : 'Añadir Nuevo Cliente'}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-deep-night-blue p-6 rounded-lg shadow-inner mb-8">
                <h3 className="text-2xl font-semibold text-neutral-light mb-4">Añadir Nuevo Cliente</h3>
                <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-neutral-light text-sm font-bold mb-2">Nombre Completo:</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newClient.name}
                      onChange={handleInputChange}
                      className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-neutral-light text-sm font-bold mb-2">Correo Electrónico (Opcional):</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newClient.email}
                      onChange={handleInputChange}
                      className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-neutral-light text-sm font-bold mb-2">Teléfono (Opcional):</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={newClient.phone}
                      onChange={handleInputChange}
                      className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-neutral-light text-sm font-bold mb-2">Dirección (Opcional):</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={newClient.address}
                      onChange={handleInputChange}
                      className="shadow appearance-none border border-neutral-gray-200 rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-action-blue bg-dark-charcoal"
                    />
                  </div>
                  <div className="md:col-span-2 text-right">
                    <button
                      type="submit"
                      className="bg-copper-rose-accent hover:bg-rose-700 text-neutral-light font-bold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      Guardar Cliente
                    </button>
                  </div>
                </form>
              </div>
            )}

            <h3 className="text-3xl font-semibold text-neutral-light mb-6 border-b border-neutral-gray-200 pb-3">Lista de Clientes</h3>

            {clients.length === 0 ? (
              <p className="text-neutral-gray-300 text-lg">No hay clientes registrados. ¡Añade uno!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                  <div key={client._id} className="bg-deep-night-blue p-6 rounded-lg shadow-lg border border-action-blue-light flex flex-col justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-copper-rose-accent mb-2">{client.name}</h4>
                      {client.email && <p className="text-neutral-light mb-1"><span className="font-semibold">Email:</span> {client.email}</p>}
                      {client.phone && <p className="text-neutral-light mb-1"><span className="font-semibold">Teléfono:</span> {client.phone}</p>}
                      {client.address && <p className="text-neutral-light mb-3"><span className="font-semibold">Dirección:</span> {client.address}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      {/* Botones de Editar y Eliminar (funcionalidad futura) */}
                      <button className="bg-neutral-gray-200 text-dark-charcoal px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-gray-300 transition duration-200 opacity-50 cursor-not-allowed flex items-center">
                        <FaEdit className="mr-1"/> Editar
                      </button>
                      <button className="bg-red-600 text-neutral-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition duration-200 opacity-50 cursor-not-allowed flex items-center">
                        <FaTrash className="mr-1"/> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ClientsPage;