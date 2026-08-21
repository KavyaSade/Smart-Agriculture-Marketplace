import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import TwoFactorVerify from '../../components/2fa/verify';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, complete2FALogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer'); // 'buyer', 'farmer', or 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form Validation & Submission State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // 2FA Flow state
  const [show2FAVerify, setShow2FAVerify] = useState(false);
  const [twoFAData, setTwoFAData] = useState({ email: '', role: '', tempCode: '' });

  // Handle URL redirect query param if any
  const queryParams = new URLSearchParams(window.location.search);
  const redirectPath = queryParams.get('redirect');

  // Handle URL role param if any
  const roleParam = queryParams.get('role');
  useEffect(() => {
    if (roleParam && ['buyer', 'farmer', 'retailer', 'admin'].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [roleParam]);

  // If already logged in, redirect home
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    if (token && userRole) {
      if (userRole === 'buyer') navigate('/buyer-dashboard');
      else if (userRole === 'farmer') navigate('/farmer-dashboard');
      else if (userRole === 'retailer') navigate('/retailer-dashboard');
      else if (userRole === 'admin') navigate('/admin-dashboard');
      else navigate('/');
    }
  }, [navigate]);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setEmail('admin@gmail.com');
      setPassword('admin123');
    } else {
      setEmail('');
      setPassword('');
    }
    setErrors({});
    setSubmitMessage('');
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleGoogleClick = async () => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const result = await loginWithGoogle(role);

      if (result.success) {
        if (result.require2FA) {
          setTwoFAData({ email: result.email, role: result.role, tempCode: result.tempCode });
          setShow2FAVerify(true);
          setIsSubmitting(false);
          return;
        }
        setSubmitMessage('Successfully logged in with Google!');

        setTimeout(() => {
          if (role === 'buyer') navigate('/buyer-dashboard');
          else if (role === 'farmer') navigate('/farmer-dashboard');
          else if (role === 'retailer') navigate('/retailer-dashboard');
          else if (role === 'admin') navigate('/admin-dashboard');
          else navigate('/');
        }, 1000);
      } else {
        setSubmitMessage(result.error || 'Google login failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setSubmitMessage('Google login error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const result = await login(email, password, role);

      if (result.success) {
        if (result.require2FA) {
          setTwoFAData({
            email,
            role,
            tempCode: result.tempCode
          });
          setShow2FAVerify(true);
          setIsSubmitting(false);
        } else {
          setSubmitMessage('Successfully logged in! Redirecting...');

          setTimeout(() => {
            if (role === 'buyer') {
              navigate(redirectPath || '/buyer-dashboard');
            } else if (role === 'farmer') {
              navigate(redirectPath || '/farmer-dashboard');
            } else if (role === 'retailer') {
              navigate(redirectPath || '/retailer-dashboard');
            } else if (role === 'admin') {
              navigate('/admin-dashboard');
            } else {
              navigate('/');
            }
          }, 1000);
        }
      } else {
        setSubmitMessage(result.error || 'Invalid credentials or role selection.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage(err.message || 'Invalid credentials or role selection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-graphic">
          <div className="login-graphic-overlay"></div>
          <motion.img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1000&fm=jpg"
            alt="Organic farming fresh produce"
            className="login-graphic-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          <div className="login-graphic-content">
            <motion.div
              className="login-logo"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Leaf className="login-logo-icon" size={28} />
              <span>Agri<span className="logo-accent">Market</span></span>
            </motion.div>

            <div className="login-graphic-middle">
              <motion.span
                className="login-graphic-tag"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Smart Agriculture Marketplace
              </motion.span>
              <motion.h1
                className="login-graphic-headline"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Trade directly. <br />Earn better. <br />Eat fresher.
              </motion.h1>
              <motion.p
                className="login-graphic-subtext"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Connecting verified farmers directly with wholesale buyers and consumers with secure escrow payments.
              </motion.p>
            </div>

            <motion.div
              className="login-graphic-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <span>&copy; AgriMarket</span>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="login-form-wrapper">
          <motion.div
            className="login-form-card"
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
              className="login-form-header"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="mobile-logo">
                <Leaf className="login-logo-icon" size={24} />
                <span>Agri<span className="logo-accent">Market</span></span>
              </div>
              <h2>Welcome Back</h2>
              <p>Enter your credentials to manage your agricultural trade</p>
            </motion.div>

            <motion.div
              className="role-selector-container"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <button
                type="button"
                className={`role-select-btn ${role === 'buyer' ? 'active' : ''}`}
                onClick={() => handleRoleChange('buyer')}
              >
                Buyer
              </button>
              <button
                type="button"
                className={`role-select-btn ${role === 'farmer' ? 'active' : ''}`}
                onClick={() => handleRoleChange('farmer')}
              >
                Farmer
              </button>
              <button
                type="button"
                className={`role-select-btn ${role === 'retailer' ? 'active' : ''}`}
                onClick={() => handleRoleChange('retailer')}
              >
                Retailer
              </button>
              <button
                type="button"
                className={`role-select-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleChange('admin')}
              >
                Admin
              </button>
            </motion.div>

            {submitMessage && (
              <div className={`form-alert ${submitMessage.includes('Successfully') ? 'alert-success' : 'alert-error'}`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Input */}
              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
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
              </motion.div>

              {/* Password Input */}
              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
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
              </motion.div>

              {/* Remember Me */}
              <motion.div
                className="remember-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Remember me on this device
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <button
                  type="submit"
                  className="btn btn-primary w-full login-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verifying Account...' : `Log In as ${role === 'farmer' ? 'Farmer' : role === 'retailer' ? 'Retailer' : role.charAt(0).toUpperCase() + role.slice(1)}`}
                </button>
              </motion.div>
            </form>

            {role !== 'admin' && (
              <>
                <motion.div
                  className="social-divider"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <span>or</span>
                </motion.div>

                <motion.div
                  className="social-login-actions"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  <button
                    type="button"
                    className="google-signin-btn"
                    onClick={handleGoogleClick}
                    disabled={isSubmitting}
                  >
                    <img src="/src/assets/icons/google.png" alt="Google" className="google-icon" width="18" height="18" />
                    <span>Sign In with Google</span>
                  </button>
                </motion.div>
              </>
            )}

            <motion.div
              className="login-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.0 }}
            >
              <p>Don't have an account? <Link to="/signup" className="register-link">Sign Up Now</Link></p>
            </motion.div>
          </motion.div>
        </div>
      </div>
      {show2FAVerify && (
        <TwoFactorVerify
          email={twoFAData.email}
          role={twoFAData.role}
          initialTempCode={twoFAData.tempCode}
          onSuccess={(loggedInUser) => {
            complete2FALogin(loggedInUser);
            setShow2FAVerify(false);
            const currentRole = loggedInUser.role || role;
            if (currentRole === 'buyer') {
              navigate('/buyer-dashboard');
            } else if (currentRole === 'farmer') {
              navigate('/farmer-dashboard');
            } else if (currentRole === 'retailer') {
              navigate('/retailer-dashboard');
            } else if (currentRole === 'admin') {
              navigate('/admin-dashboard');
            } else {
              navigate('/');
            }
          }}
          onCancel={() => setShow2FAVerify(false)}
        />
      )}
    </div>
  );
}
