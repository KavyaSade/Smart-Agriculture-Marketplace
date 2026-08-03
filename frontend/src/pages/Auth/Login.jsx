import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Leaf } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer'); // 'buyer' or 'farmer'
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    setSubmitMessage('');
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage('Successfully logged in! Redirecting to marketplace...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }, 1200);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        {/* Left Side: Graphic & Marketing Info (Visible on Desktop) */}
        <div className="login-graphic">
          <div className="login-graphic-overlay"></div>
          <img 
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1000" 
            alt="Organic farming fresh produce" 
            className="login-graphic-bg"
          />
          <div className="login-graphic-content">
            <div className="login-logo">
              <Leaf className="login-logo-icon" size={28} />
              <span>Agri<span className="logo-accent">Market</span></span>
            </div>
            
            <div className="login-graphic-middle">
              <span className="login-graphic-tag">
                Smart Agriculture Marketplace
              </span>
              <h1 className="login-graphic-headline">
                Trade directly. <br />Earn better. <br />Eat fresher.
              </h1>
              <p className="login-graphic-subtext">
                Connecting verified farmers directly with wholesale buyers and consumers with secure escrow payments.
              </p>
            </div>

            <div className="login-graphic-footer">
              <span>&copy; AgriMarket</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="login-form-wrapper">
          <div className="login-form-card animate-fade-in-up">
            <Link to="/" className="back-home-link">
              <ArrowLeft size={16} /> Back to home
            </Link>
            <div className="login-form-header">
              <div className="mobile-logo">
                <Leaf className="login-logo-icon" size={24} />
                <span>Agri<span className="logo-accent">Market</span></span>
              </div>
              <h2>Welcome Back</h2>
              <p>Enter your credentials to manage your agricultural trade</p>
            </div>

            {/* Role selector buttons */}
            <div className="role-selector-container">
              <button 
                type="button" 
                className={`role-select-btn ${role === 'buyer' ? 'active' : ''}`}
                onClick={() => setRole('buyer')}
              >
                I am a Buyer
              </button>
              <button 
                type="button" 
                className={`role-select-btn ${role === 'farmer' ? 'active' : ''}`}
                onClick={() => setRole('farmer')}
              >
                I am a Farmer
              </button>
            </div>

            {submitMessage && (
              <div className={`form-alert ${submitMessage.includes('Successfully') ? 'alert-success' : 'alert-error'}`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={20} />
                  <input
                    id="email"
                    type="email"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {/* Password Input */}
              <div className="form-group">
                <div className="label-row">
                  <label className="form-label" htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
                </div>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={20} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              {/* Remember Me */}
              <div className="remember-row">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Remember me on this device
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary w-full login-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying Account...' : `Log In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
              </button>
            </form>

            <div className="login-footer">
              <p>Don't have an account? <Link to="/signup" className="register-link">Sign Up Now</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
