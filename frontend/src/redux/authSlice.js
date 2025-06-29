import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';

// El refreshToken ya no se guarda en el estado ni en localStorage. Vive en una cookie httpOnly.
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: false,
  // Debe empezar en true para que la app muestre "Cargando..." mientras se verifica el token.
  isLoading: true,
  isError: false,
  message: '',
};

// Thunk para verificar el estado de autenticación al cargar la app
export const verifyAuth = createAsyncThunk(
  'auth/verifyAuth',
  async (_, thunkAPI) => {
    try {
      // El interceptor de axios usará el token del localStorage para autenticar esta petición.
      // Asumimos que tienes un endpoint como '/api/users/profile' que devuelve los datos del usuario si el token es válido.
      const response = await axiosInstance.get('/users/profile');
      return response.data; // El payload será el objeto de usuario.
    } catch (error) {
      const message =
        (error.response?.data?.message) || 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Thunk para login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/auth/login', userData);
      const { user, accessToken } = response.data; // El refreshToken ya no viene aquí
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      return { user, accessToken };
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Thunk para logout
export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    // Solo necesitamos llamar al endpoint. El navegador se encarga de enviar la cookie.
    await axiosInstance.post('/auth/logout');
  } catch (e) {
    // Ignorar errores de logout es aceptable, ya que el objetivo principal es limpiar el estado del cliente.
    console.warn('API call to /auth/logout failed, but proceeding with client-side logout.', e);
  }
  // Limpiamos el localStorage del lado del cliente para borrar el rastro.
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
});

// Thunk para registro
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.message = '¡Login exitoso!';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false; // Aseguramos que el estado de carga termine
        state.message = '¡Sesión cerrada!';
      })
      // Casos para el nuevo thunk verifyAuth
      .addCase(verifyAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Casos para registerUser que faltaban
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message || '¡Registro exitoso! Ya puedes iniciar sesión.';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
  },
});

export const { reset, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
