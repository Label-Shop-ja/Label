// Notification state management with Redux
import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    message: '',
    type: '',
    timeoutId: null
  },
  reducers: {
    showNotification: (state, action) => {
      const { message, type = 'info' } = action.payload;
      
      // Clear any existing timeout
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
      }
      
      state.message = message;
      state.type = type;
      
      // Set timeout to clear notification
      if (message) {
        state.timeoutId = setTimeout(() => {
          // This will be handled by clearNotification action
        }, 4000);
      }
    },
    clearNotification: (state) => {
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
      }
      state.message = '';
      state.type = '';
    }
  }
});

// Selectors
export const selectNotification = (state) => state.notification;

// Thunk for auto-clearing notification
export const showNotificationWithTimeout = (message, type = 'info') => (dispatch) => {
  dispatch(showNotification({ message, type }));
  
  setTimeout(() => {
    dispatch(clearNotification());
  }, 4000);
};

export const { showNotification, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;