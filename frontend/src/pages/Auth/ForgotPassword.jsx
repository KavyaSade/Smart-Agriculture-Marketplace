import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Leaf, CheckCircle } from 'lucide-react';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-container">
        
        {/* Left Side: Graphic & Marketing Info (Visible on Desktop) */}
        <div className="forgot-graphic">
          <div className="forgot-graphic-overlay"></div>
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1000&auto=format&fit=crop&fm=jpg" 
            alt="Beautiful sunset farm field" 
            className="forgot-graphic-bg"
          />
          <div className="forgot-graphic-content">
            <div className="forgot-logo">
              <Leaf className="forgot-logo-icon" size={28} />
              <span>Agri<span className="logo-accent">Market</span></span>
            </div>
            
            <div className="forgot-graphic-middle">
              <span className="forgot-graphic-tag">
                Smart Agriculture Marketplace
              </span>
              <h1 className="forgot-graphic-headline">
                Forgot your details? <br />Recover your account <br />securely.
              </h1>
              <p className="forgot-graphic-subtext">
                Enter your email address to reset your password and continue trading.
              </p>
            </div>

            <div className="forgot-graphic-footer">
              <span>&copy; AgriMarket</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="forgot-form-wrapper">
          <div className="forgot-card animate-fade-in-up">
            <Link to="/login" className="back-login-link">
              <ArrowLeft size={16} /> Back to Login
            </Link>
            
            <div className="forgot-header">
              <div className="mobile-logo">
                <Leaf className="forgot-logo-icon" size={24} />
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
                </div>
              )}
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="forgot-form">
                {/* Email Address */}
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

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="btn btn-primary w-full forgot-submit-btn"
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

            <div className="forgot-footer">
              <p>Remember your password? <Link to="/login" className="login-link">Log In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
