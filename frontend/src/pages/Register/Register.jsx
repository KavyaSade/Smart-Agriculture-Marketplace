import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  
  const handleGoogleClick = async () => {
    setIsSubmitting(true);
    setSubmitMessage('');
    setErrors({});
    
    const result = await loginWithGoogle(formData.role);
    setIsSubmitting(false);

    if (result.success) {
      setSubmitMessage('Successfully registered and logged in with Google!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setSubmitMessage(result.error || 'Google Registration failed.');
    }
  };
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'farmer', // Default to farmer
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) {
      tempErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(formData.phone)) {
      tempErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else {
      const password = formData.password;
      const hasCapital = /[A-Z]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isMinLength = password.length >= 8;
      
      if (!isMinLength) {
        tempErrors.password = 'Password must be at least 8 characters';
      } else if (!hasCapital) {
        tempErrors.password = 'Password must contain at least 1 uppercase letter';
      } else if (!hasSpecial) {
        tempErrors.password = 'Password must contain at least 1 special character (e.g., !@#$%^&*)';
      }
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      tempErrors.agreeTerms = 'You must agree to the Terms & Conditions';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    const registerData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      password: formData.password
    };

    const result = await register(registerData);
    setIsSubmitting(false);

    if (result.success) {
      setSubmitMessage('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setSubmitMessage(result.error || 'Failed to register account.');
    }
  };

  const checks = {
    length: formData.password.length >= 8,
    capital: /[A-Z]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  return (
    <div className="register-page">
      <div className="register-container">
        
        {/* Left Side: Graphic & Marketing Info (Visible on Desktop) */}
        <div className="register-graphic">
          <div className="register-graphic-overlay"></div>
          <img 
            src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1000&auto=format&fit=crop&fm=jpg" 
            alt="Farmers working in field" 
            className="register-graphic-bg"
          />
          <div className="register-graphic-content">
            <div className="register-logo">
              <Leaf className="register-logo-icon" size={28} />
              <span>Agri<span className="logo-accent">Market</span></span>
            </div>
            
            <div className="register-graphic-middle">
              <span className="register-graphic-tag">
                Smart Agriculture Marketplace
              </span>
              <h1 className="register-graphic-headline">
                Grow your business. <br />Trade securely. <br />Succeed together.
              </h1>
              <p className="register-graphic-subtext">
                Create a free account to list your products or start buying directly from verified growers.
              </p>
            </div>

            <div className="register-graphic-footer">
              <span>&copy; AgriMarket</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="register-form-wrapper">
          <div className="register-form-card animate-fade-in-up">
            <Link to="/" className="back-home-link">
              <ArrowLeft size={16} /> Back to home
            </Link>
            <div className="register-form-header">
              <div className="mobile-logo">
                <Leaf className="register-logo-icon" size={24} />
                <span>Agri<span className="logo-accent">Market</span></span>
              </div>
              <h2>Create Account</h2>
              <p>Register as a farmer or a buyer and start trading today</p>
            </div>

            {submitMessage && (
              <div className={`form-alert ${submitMessage.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="register-form-grid">
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Your Name</label>
                  <div className="input-with-icon">
                    <User className="input-icon" size={20} />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                      placeholder="Enter your name"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" size={20} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`form-input ${errors.email ? 'input-error' : ''}`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                {/* Phone Number */}
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <div className="input-with-icon">
                    <Phone className="input-icon" size={20} />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={`form-input ${errors.phone ? 'input-error' : ''}`}
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                {/* Role Selection Dropdown */}
                <div className="form-group">
                  <label className="form-label" htmlFor="role">Register As</label>
                  <select
                    id="role"
                    name="role"
                    className="form-input custom-select"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="buyer">Buyer (Buy Crops)</option>
                    <option value="farmer">Farmer (Sell Crops)</option>
                    <option value="retailer">Retailer</option>
                  </select>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" size={20} />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${errors.password ? 'input-error' : ''}`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
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
                  {passwordFocused && (
                    <ul className="password-checklist">
                      <li className={checks.length ? 'checked' : 'unchecked'}>
                        <span className="checklist-dot"></span> At least 8 characters
                      </li>
                      <li className={checks.capital ? 'checked' : 'unchecked'}>
                        <span className="checklist-dot"></span> At least 1 uppercase letter (A-Z)
                      </li>
                      <li className={checks.special ? 'checked' : 'unchecked'}>
                        <span className="checklist-dot"></span> At least 1 special symbol
                      </li>
                    </ul>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" size={20} />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* Agree to terms */}
              <div className="remember-row">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  I agree to the <a href="#terms" className="terms-link">Terms of Service</a> & <a href="#privacy" className="terms-link">Privacy Policy</a>
                </label>
                {errors.agreeTerms && <span className="error-text block mt-1">{errors.agreeTerms}</span>}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary w-full register-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>

            <div className="social-divider">
              <span>or register with</span>
            </div>

            <div className="social-login-actions">
              <button 
                type="button" 
                className="google-signin-btn"
                onClick={handleGoogleClick}
                disabled={isSubmitting}
              >
                <img src="/src/assets/icons/google.png" alt="Google" className="google-icon" width="18" height="18" />
                <span>Sign Up with Google</span>
              </button>
            </div>

            <div className="register-footer">
              <p>Already have an account? <Link to="/login" className="register-link">Log In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
