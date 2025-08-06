// Theme state management with Redux
import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: (() => {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'light' ? 'light' : 'dark';
    })()
  },
  reducers: {
    setTheme: (state, action) => {
      const newTheme = action.payload === 'light' ? 'light' : 'dark';
      state.theme = newTheme;
      
      // Update DOM and localStorage
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark', 'classic');
      
      if (newTheme === 'light') {
        root.classList.add('light');
      }
      
      localStorage.setItem('theme', newTheme);
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      
      // Update DOM and localStorage
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark', 'classic');
      
      if (newTheme === 'light') {
        root.classList.add('light');
      }
      
      localStorage.setItem('theme', newTheme);
    }
  }
});

// Selectors
export const selectTheme = (state) => state.theme.theme;

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;