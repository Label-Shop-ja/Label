// Custom hook for notification management with Redux
import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { 
  showNotificationWithTimeout, 
  clearNotification, 
  selectNotification 
} from '../redux/notificationSlice';

export const useReduxNotification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(selectNotification);

  const showNotification = useCallback((message, type = 'info') => {
    dispatch(showNotificationWithTimeout(message, type));
  }, [dispatch]);

  const clearNotificationAction = useCallback(() => {
    dispatch(clearNotification());
  }, [dispatch]);

  return {
    notification,
    showNotification,
    clearNotification: clearNotificationAction
  };
};