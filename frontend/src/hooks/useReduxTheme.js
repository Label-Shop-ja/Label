// Custom hook for theme management with Redux
import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { setTheme, toggleTheme, selectTheme } from '../redux/themeSlice';

export const useReduxTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  const setThemeAction = useCallback((newTheme) => {
    dispatch(setTheme(newTheme));
  }, [dispatch]);

  const toggleThemeAction = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  return {
    theme,
    setTheme: setThemeAction,
    toggleTheme: toggleThemeAction
  };
};