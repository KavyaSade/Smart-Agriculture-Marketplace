import React, { createContext, useState, useEffect, useContext } from 'react';
import { signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase.js';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token exists in localStorage on mount and retrieve user data
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token is invalid/expired
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (err) {
          console.error('Error auto-verifying JWT:', err);
          // Don't clear token on network failure, just let it be
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Log in user
   * @param {string} email 
   * @param {string} password 
   * @param {string} role 
   */
  const login = async (email, password, role) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login.');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Register a new user
   * @param {object} registerData 
   */
  const register = async (registerData) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register.');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Log out user
   */
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  /**
   * Log in user with Google (Firebase popup + backend registration/login)
   * @param {string} role 
   */
  const loginWithGoogle = async (role = 'buyer') => {
    setError(null);
    setLoading(true);

    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase Auth not configured. Simulating Google Login.");
      // Fallback local simulation mode
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const simulatedEmail = `google.user.${Math.floor(Math.random() * 1000)}@gmail.com`;
      const registerData = {
        fullName: 'Simulated Google User',
        email: simulatedEmail,
        role: role
      };

      try {
        const response = await fetch(`${API_BASE_URL}/google-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registerData)
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to login with Google simulation.');
        }

        localStorage.setItem('token', data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true, user: data.user };
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return { success: false, error: err.message };
      }
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const registerData = {
        fullName: googleUser.displayName || googleUser.email.split('@')[0],
        email: googleUser.email,
        role: role
      };

      const response = await fetch(`${API_BASE_URL}/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register/login Google account on backend.');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      let errorMessage = 'Google login failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed before completion.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Send Password Reset link to the registered email address
   * @param {string} email 
   */
  const sendPasswordReset = async (email) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase Auth not configured. Simulating Password Reset Link dispatch.");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      console.error('Firebase Password Reset Error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, loginWithGoogle, register, logout, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};