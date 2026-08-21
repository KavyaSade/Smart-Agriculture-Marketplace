import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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
      setSubmitMessage('Google registration successful!');
      setTimeout(() => {
        if (formData.role === 'buyer') {
          navigate('/buyer-dashboard', { replace: true });
        } else if (formData.role === 'farmer') {
          navigate('/farmer-dashboard', { replace: true });
        } else if (formData.role === 'retailer') {
          navigate('/retailer-dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 1500);
    } else {
      setSubmitMessage(result.error || 'Google Login failed.');
    }
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'buyer',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Validation & Submission State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Password strength checks
  const checks = {
    length: formData.password.length >= 8,
    capital: /[A-Z]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password)
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear errors when field is typed
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (submitMessage) {
      setSubmitMessage('');
    }
  };

  const validate = () => {
    const tempErrors = {};

    if (!formData.fullName.trim()) {
      tempErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-()]/g, ''))) {
      tempErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else {
      if (!checks.length) tempErrors.password = 'Password must be at least 8 characters long';
      else if (!checks.capital) tempErrors.password = 'Password must contain at least 1 uppercase letter';
      else if (!checks.special) tempErrors.password = 'Password must contain at least 1 special character';
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      tempErrors.agreeTerms = 'You must agree to the terms and privacy policy';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const result = await register({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });
      setIsSubmitting(false);

      if (result.success) {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          role: 'buyer',
          password: '',
          confirmPassword: '',
          agreeTerms: false
        });
        setSubmitMessage('Account created successfully! Redirecting...');

        setTimeout(() => {
          if (formData.role === 'buyer') {
            navigate('/buyer-dashboard', { replace: true });
          } else if (formData.role === 'farmer') {
            navigate('/farmer-dashboard', { replace: true });
          } else if (formData.role === 'retailer') {
            navigate('/retailer-dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 1500);
      } else {
        setSubmitMessage(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage(err.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-graphic">
          <div className="register-graphic-overlay"></div>
          <motion.img
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1000"
            alt="Beautiful green agriculture field"
            className="register-graphic-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          <div className="register-graphic-content">
            <motion.div
              className="register-logo"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Leaf className="register-logo-icon" size={28} />
              <span>Agri<span className="logo-accent">Market</span></span>
            </motion.div>

            <div className="register-graphic-middle">
              <motion.span
                className="register-graphic-tag"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Direct Trading Escrow platform
              </motion.span>
              <motion.h1
                className="register-graphic-headline"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Connect. <br />Trade Securely. <br />Grow Together.
              </motion.h1>
              <motion.p
                className="register-graphic-subtext"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Creating trust in local trade through verified identities and secure payments.
              </motion.p>
            </div>

            <motion.div
              className="register-graphic-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <span>&copy; AgriMarket</span>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="register-form-wrapper">
          <motion.div
            className="register-form-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Link to="/" className="back-home-link">
                <ArrowLeft size={16} /> Back to home
              </Link>
            </motion.div>

            <motion.div
              className="register-form-header"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="mobile-logo">
                <Leaf className="register-logo-icon" size={24} />
                <span>Agri<span className="logo-accent">Market</span></span>
              </div>
              <h2>Create Account</h2>
              <p>Register as a farmer or a buyer and start trading today</p>
            </motion.div>

            {submitMessage && (
              <div className={`form-alert ${submitMessage.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="register-form-grid">
                {/* Full Name */}
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
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
                </motion.div>

                {/* Email Address */}
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                >
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
                </motion.div>

                {/* Phone Number */}
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
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
                </motion.div>

                {/* Role Selection Dropdown */}
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                >
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
                </motion.div>

                {/* Password */}
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
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
                </motion.div>

                {/* Confirm Password */}
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.55 }}
                >
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
                </motion.div>
              </div>

              {/* Agree to terms */}
              <motion.div
                className="remember-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
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
              </motion.div>

              {/* Submit Button */}
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.65 }}
              >
                <button
                  type="submit"
                  className="btn btn-primary w-full register-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Register Account'}
                </button>
              </motion.div>
            </form>

            <motion.div
              className="social-divider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <span>or register with</span>
            </motion.div>

            <motion.div
              className="social-login-actions"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.75 }}
            >
              <button
                type="button"
                className="google-signin-btn"
                onClick={handleGoogleClick}
                disabled={isSubmitting}
              >
                <img src="/src/assets/icons/google.png" alt="Google" className="google-icon" width="18" height="18" />
                <span>Sign Up with Google</span>
              </button>
            </motion.div>

            <motion.div
              className="register-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <p>Already have an account? <Link to="/login" className="register-link">Log In</Link></p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
