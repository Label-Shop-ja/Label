import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyAuth,
  reset,
} from '../redux/authSlice';

/**
 * Un hook personalizado que centraliza toda la lógica de autenticación de Redux.
 * Proporciona el estado de autenticación y las acciones ya vinculadas al dispatch,
 * haciendo que los componentes sean más limpios y declarativos.
 */
export const useAuth = () => {
  const dispatch = useDispatch();

  // 1. Seleccionamos las partes del estado de autenticación que los componentes necesitan.
  const { user, isAuthenticated, isLoading, isError, message } = useSelector(
    (state) => state.auth
  );

  // 2. `bindActionCreators` envuelve nuestras acciones en `dispatch`.
  //    Así, en lugar de llamar a `dispatch(loginUser(data))`, podemos simplemente llamar a `actions.login(data)`.
  //    `useMemo` asegura que este objeto de acciones no se recree en cada render, optimizando el rendimiento.
  const actions = useMemo(
    () =>
      bindActionCreators(
        {
          login: loginUser,
          logout: logoutUser,
          register: registerUser,
          verify: verifyAuth,
          reset,
        },
        dispatch
      ),
    [dispatch]
  );

  // 3. Devolvemos un objeto único y memorizado con el estado y las acciones.
  //    Esto es lo que consumirán nuestros componentes.
  return { user, isAuthenticated, isLoading, isError, message, ...actions };
};

export default useAuth;