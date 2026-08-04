import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Leaf, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ResetPassword.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // trigger countdown timer and redirect when email is sent successfully
  useEffect(() => {
    if (!isSuccess) return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isSuccess, navigate]);

  const validate = () => {
    if (!email) {
      setError('Email address is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await sendPasswordReset(email);
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      setIsSubmitting(false);
      let message = 'Failed to send password reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-container">
        
        {/* left side: graphic and marketing info */}
        <div className="reset-graphic">
          <div className="reset-graphic-overlay"></div>
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1000&auto=format&fit=crop&fm=jpg" 
            alt="Beautiful sunset farm field" 
            className="reset-graphic-bg"
          />
          <div className="reset-graphic-content">
            <div className="reset-logo">
              <Leaf className="reset-logo-icon" size={28} />
              <span>Agri<span className="logo-accent">Market</span></span>
            </div>
            
            <div className="reset-graphic-middle">
              <span className="reset-graphic-tag">
                Smart Agriculture Marketplace
              </span>
              <h1 className="reset-graphic-headline">
                Forgot your details? <br />Recover your account <br />securely.
              </h1>
              <p className="reset-graphic-subtext">
                Enter your email address to reset your password and continue trading.
              </p>
            </div>

            <div className="reset-graphic-footer">
              <span>&copy; AgriMarket</span>
            </div>
          </div>
        </div>

        {/* right side: form card */}
        <div className="reset-form-wrapper">
          <div className="reset-card animate-fade-in-up">
            <Link to="/login" className="back-login-link">
              <ArrowLeft size={16} /> Back to Login
            </Link>
            
            <div className="reset-header">
              <div className="mobile-logo">
                <Leaf className="reset-logo-icon" size={24} />
                <span>Agri<span className="logo-accent">Market</span></span>
              </div>
              
              {!isSuccess ? (
                <>
                  <h2>Reset Password</h2>
                  <p>Enter the email address associated with your account, and we'll send you link instructions to reset your password.</p>
                </>
              ) : (
                <div className="success-header animate-fade-in-up">
                  <CheckCircle className="success-icon" size={48} />
                  <h2>Check Your Email</h2>
                  <p>We've sent a password reset link to: <br /><strong className="success-email">{email}</strong></p>
                  <p style={{ marginTop: '16px', fontSize: '0.875rem', color: '#16a34a', fontWeight: '500' }}>
                    Redirecting to login page in {countdown} seconds...
                  </p>
                </div>
              )}
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="reset-form">
                {/* email address */}
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" size={20} />
                    <input
                      id="email"
                      type="email"
                      className={`form-input ${error ? 'input-error' : ''}`}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <span className="error-text">{error}</span>}
                </div>

                {/* submit button */}
                <button 
                  type="submit" 
                  className="btn btn-primary w-full reset-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending instructions...' : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="success-actions animate-fade-in-up">
                <p className="success-tip">Did not receive the email? Check your spam filter or try again.</p>
                <button 
                  type="button" 
                  className="btn btn-secondary w-full"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                >
                  Try Another Email
                </button>
              </div>
            )}

            <div className="reset-footer">
              <p>Remember your password? <Link to="/login" className="login-link">Log In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
