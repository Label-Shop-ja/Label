import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from './authService';

// Cargar el estado inicial desde localStorage para persistencia básica
const userFromStorage = JSON.parse(localStorage.getItem('user'));
const tokenFromStorage = localStorage.getItem('accessToken');

const initialState = {
  user: userFromStorage || null,
  accessToken: tokenFromStorage || null,
  isAuthenticated: !!tokenFromStorage,
  isLoading: false,
  isError: false,
  isSuccess: false, // Nuevo estado para manejar el éxito de acciones como el registro
  message: '',
  forgotPasswordStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  resetPasswordStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  verifyCodeStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
};

// --- Async Thunks ---

// Registrar usuario
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Iniciar sesión de usuario
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.login(userData);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Verificar autenticación al cargar la app
export const verifyAuth = createAsyncThunk(
  'auth/verify',
  async (_, thunkAPI) => {
    try {
      const response = await authService.verifyToken();
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      thunkAPI.dispatch(authSlice.actions.logoutUser());
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk para solicitar reseteo de contraseña
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, thunkAPI) => {
    try {
      // El servicio ya devuelve la data, así que la retornamos directamente.
      return await authService.forgotPassword(email);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk para verificar el código de reseteo
export const verifyResetCode = createAsyncThunk(
  'auth/verifyResetCode',
  async (verificationData, thunkAPI) => {
    try {
      return await authService.verifyResetCode(verificationData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk para restablecer la contraseña
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, thunkAPI) => {
    try {
      return await authService.resetPassword(resetData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false; // Resetear el estado de éxito también
      state.message = '';
      state.forgotPasswordStatus = 'idle';
      state.resetPasswordStatus = 'idle';
      state.verifyCodeStatus = 'idle';
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    },
    logoutUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    },
    // Acción para establecer las credenciales manualmente (útil para el callback de OAuth)
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isError = false;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoading = true;
    };
    const handleFulfilled = (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('accessToken', action.payload.accessToken);
    };
    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    };

    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true; // Marcamos que la operación fue exitosa
        state.message = action.payload.message; // Guardamos el mensaje de éxito del backend
      })
      .addCase(registerUser.rejected, handleRejected) // Reutilizamos el manejador de rechazo
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, handleFulfilled)
      .addCase(loginUser.rejected, handleRejected)
      .addCase(verifyAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.isLoading = false;
      })
      // Casos para el reseteo de contraseña
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.forgotPasswordStatus = 'loading';
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forgotPasswordStatus = 'succeeded';
        state.message = action.payload.message; // Guardamos el mensaje de éxito del backend
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.forgotPasswordStatus = 'failed';
        state.message = action.payload;
      })
      // Casos para la verificación del código
      .addCase(verifyResetCode.pending, (state) => {
        state.isLoading = true;
        state.verifyCodeStatus = 'loading';
      })
      .addCase(verifyResetCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.verifyCodeStatus = 'succeeded';
        // Guardamos el token temporal en el accessToken para autorizar el siguiente paso
        state.accessToken = action.payload.resetToken;
        state.message = action.payload.message;
      })
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.verifyCodeStatus = 'failed';
        state.message = action.payload;
      })
      // Casos para el restablecimiento de contraseña
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.resetPasswordStatus = 'loading';
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetPasswordStatus = 'succeeded';
        state.message = action.payload.message; // Mensaje de éxito del backend
        // Limpiamos el token temporal después de usarlo
        state.accessToken = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.resetPasswordStatus = 'failed';
        state.message = action.payload;
      });
  },
});

export const { reset, setAccessToken, logoutUser, setCredentials } = authSlice.actions; // No olvides exportar la nueva acción

export default authSlice.reducer;
