import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fbf9',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          border: '4px solid rgba(82, 183, 136, 0.1)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          borderLeftColor: '#40916c',
          animation: 'spin-route-loader 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin-route-loader {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'farmer') return <Navigate to="/farmer-dashboard" replace />;
    if (user.role === 'buyer') return <Navigate to="/buyer-dashboard" replace />;
    if (user.role === 'retailer') return <Navigate to="/retailer-dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
