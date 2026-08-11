import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SessionTimeout() {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) return;

    let timeoutId;

    // Reset the inactivity countdown
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 3600000); 
    };

    // Listen to user interactions
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));

    // Start the initial countdown
    resetTimer();

    // Clean up listeners and timers
    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, logout]);

  return null;
}


