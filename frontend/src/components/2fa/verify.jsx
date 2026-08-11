import React, { useState } from 'react';
import './2fa.css';

export default function TwoFactorVerify({ email, role, onSuccess, onCancel }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // handle verify button click
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role, code })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid code.');
      }

      localStorage.setItem('token', data.token); // save token
      onSuccess(data.user); // login user
    } catch (err) {
      setError(err.message || 'Wrong code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // handle resend code button click
  const handleResend = async () => {
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      alert('A new code has been sent. Check your inbox!');
    } catch (err) {
      setError('Failed to resend code.');
    }
  };

  return (
    <div className="verify-2fa-overlay">
      <div className="verify-2fa-card" style={{ textAlign: 'center' }}>
        <h3 className="verify-2fa-title">Security Verification</h3>
        <p className="verify-2fa-subtitle">
          Please enter the 6-digit code sent to <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength="6"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // allow only numbers
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '1.5rem',
              textAlign: 'center',
              letterSpacing: '5px',
              borderRadius: '8px',
              border: '2.5px solid #52b788',
              marginBottom: '15px',
              background: '#f8f9fa'
            }}
            disabled={loading}
          />

          {error && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '15px' }}>{error}</p>}

          <button
            type="submit"
            className="verify-2fa-btn"
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Checking...' : 'Verify Code'}
          </button>
        </form>

        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'gray', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleResend} style={{ background: 'none', border: 'none', color: '#40916c', fontWeight: 'bold', cursor: 'pointer' }}>
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}
