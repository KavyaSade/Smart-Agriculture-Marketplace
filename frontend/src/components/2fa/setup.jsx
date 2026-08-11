import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './2fa.css';

export default function TwoFactorSetup({ isTwoFactorEnabled, onToggleSuccess }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState('');

  // countdown timer: logs out user when it reaches 0
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      logout(); // logout user
      navigate('/login'); // redirect to login
    }
  }, [countdown, logout, navigate]);

  // calls API to enable or disable 2FA
  const handleToggle = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    const newState = !isTwoFactorEnabled;

    try {
      const response = await fetch('http://localhost:5000/api/users/profile/2fa', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: newState })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error updating settings.');
      }

      onToggleSuccess(data.isTwoFactorEnabled);

      if (newState === true) {
        setCountdown(5); // start 5 second countdown
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="two-factor-setup-card">
      <h3 className="two-factor-title">Two-Factor Authentication (2FA)</h3>
      <p className="two-factor-description">
        Add extra security to your account. Enter a 6-digit code when you log in.
      </p>

      {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}

      <div className="two-factor-action-row">
        <span>Status: <strong>{isTwoFactorEnabled ? 'Enabled' : 'Disabled'}</strong></span>
        <button
          onClick={handleToggle}
          disabled={loading || countdown !== null}
          className={`two-factor-toggle-btn ${isTwoFactorEnabled ? 'btn-disable' : 'btn-enable'}`}
        >
          {loading ? 'Please wait...' : isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      </div>

      {countdown !== null && (
        <div style={{ marginTop: '1rem', color: 'green', fontWeight: 'bold' }}>
          2FA Enabled! Logging out in {countdown} seconds...
        </div>
      )}
    </div>
  );
}
