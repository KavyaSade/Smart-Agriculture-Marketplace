import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Leaf } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }, 1500);
  };

  const checks = {
    length: formData.password.length >= 8,
    capital: /[A-Z]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  return (
    <div className="w-screen h-screen overflow-hidden font-sans bg-[#f8faf9] m-0 p-0">
      <div className="w-full h-full flex overflow-hidden">
        
        {/* Left Side: Graphic & Marketing Info (Visible on Desktop) */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 lg:p-16 text-white overflow-hidden h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-[#123524]/95 to-[#1e5c3f]/95 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1000&auto=format&fit=crop&fm=jpg" 
            alt="Farmers working in field" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out scale-105 hover:scale-100"
          />
          <div className="relative z-20 flex flex-col justify-between h-full w-full">
            <div className="relative z-20 flex items-center gap-2 text-2xl font-extrabold">
              <Leaf className="text-fresh" size={28} />
              <span>Agri<span className="text-fresh">Market</span></span>
            </div>
            
            <div className="flex flex-col gap-4 my-auto max-w-[480px]">
              <span className="text-xs font-bold uppercase tracking-[2px] text-fresh/95">
                Smart Agriculture Marketplace
              </span>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Grow your business. <br />Trade securely. <br />Succeed together.
              </h1>
              <p className="text-sm lg:text-base text-white/80 leading-relaxed font-medium">
                Create a free account to list your products or start buying directly from verified growers.
              </p>
            </div>

            <div className="text-xs font-medium text-white/50">
              <span>&copy; AgriMarket</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-16 bg-[#f8faf9] overflow-y-auto h-full custom-scrollbar">
          <div className="w-full max-w-[560px] flex flex-col bg-white p-8 sm:p-10 rounded-md shadow-lg border border-glass-border animate-fade-in-up">
            <Link to="/" className="mb-6 flex items-center gap-1.5 text-xs font-bold text-accent hover:text-primary transition-colors focus:outline-none">
              <ArrowLeft size={16} /> Back to home
            </Link>
            <div className="mb-2">
              <div className="flex md:hidden items-center gap-1.5 text-xl font-extrabold text-primary mb-4">
                <Leaf className="text-fresh" size={24} />
                <span>Agri<span className="text-fresh">Market</span></span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight mb-1">Create Account</h2>
              <p className="text-sm text-muted leading-normal">Register as a farmer or a buyer and start trading today</p>
            </div>

            {submitMessage && (
              <div className={`p-3 rounded-sm text-xs font-semibold mb-3 text-left border ${submitMessage.includes('successfully') ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                {/* Full Name */}
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-semibold text-primary" htmlFor="fullName">Your Name</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 text-muted/65 pointer-events-none" size={20} />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className={`w-full rounded-sm border bg-white pl-12 pr-4 py-2 text-sm text-dark outline-none transition-all duration-200 placeholder:text-muted/70 focus:border-fresh focus:ring-4 focus:ring-sage ${errors.fullName ? 'border-red-500/50 focus:border-red-500 focus:ring-red-100 bg-red-50/10' : 'border-border'}`}
                      placeholder="Enter your name"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.fullName && <span className="text-[11px] text-red-600 mt-1 font-semibold">{errors.fullName}</span>}
                </div>

                {/* Email Address */}
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-semibold text-primary" htmlFor="email">Email</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 text-muted/65 pointer-events-none" size={20} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`w-full rounded-sm border bg-white pl-12 pr-4 py-2 text-sm text-dark outline-none transition-all duration-200 placeholder:text-muted/70 focus:border-fresh focus:ring-4 focus:ring-sage ${errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-100 bg-red-50/10' : 'border-border'}`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <span className="text-[11px] text-red-600 mt-1 font-semibold">{errors.email}</span>}
                </div>

                {/* Phone Number */}
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-semibold text-primary" htmlFor="phone">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 text-muted/65 pointer-events-none" size={20} />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={`w-full rounded-sm border bg-white pl-12 pr-4 py-2 text-sm text-dark outline-none transition-all duration-200 placeholder:text-muted/70 focus:border-fresh focus:ring-4 focus:ring-sage ${errors.phone ? 'border-red-500/50 focus:border-red-500 focus:ring-red-100 bg-red-50/10' : 'border-border'}`}
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.phone && <span className="text-[11px] text-red-600 mt-1 font-semibold">{errors.phone}</span>}
                </div>

                {/* Role Selection Dropdown */}
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-semibold text-primary" htmlFor="role">Register As</label>
                  <div className="relative flex items-center">
                    <select
                      id="role"
                      name="role"
                      className="w-full rounded-sm border border-border bg-white pl-4 pr-10 py-2 text-sm text-dark outline-none transition-all duration-200 focus:border-fresh focus:ring-4 focus:ring-sage appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%252355625b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.25em'
                      }}
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="farmer">Farmer (Sell Crops)</option>
                      <option value="buyer">Buyer (Buy Crops)</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-semibold text-primary" htmlFor="password">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 text-muted/65 pointer-events-none" size={20} />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full rounded-sm border bg-white pl-12 pr-12 py-2 text-sm text-dark outline-none transition-all duration-200 placeholder:text-muted/70 focus:border-fresh focus:ring-4 focus:ring-sage ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-100 bg-red-50/10' : 'border-border'}`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    <button
                      type="button"
                      className="absolute right-4 text-muted/60 hover:text-primary transition-colors focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="text-[11px] text-red-600 mt-1 font-semibold">{errors.password}</span>}
                  {(passwordFocused || formData.password.length > 0) && (
                    <ul className="mt-2 flex flex-col gap-1 text-[11px] text-muted transition-all duration-300">
                      <li className={`flex items-center gap-1.5 font-medium transition-colors duration-200 ${checks.length ? 'text-accent' : 'text-muted/60'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${checks.length ? 'bg-fresh shadow-[0_0_6px_#52b788]' : 'bg-muted/30'}`}></span> At least 8 characters
                      </li>
                      <li className={`flex items-center gap-1.5 font-medium transition-colors duration-200 ${checks.capital ? 'text-accent' : 'text-muted/60'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${checks.capital ? 'bg-fresh shadow-[0_0_6px_#52b788]' : 'bg-muted/30'}`}></span> At least 1 uppercase letter (A-Z)
                      </li>
                      <li className={`flex items-center gap-1.5 font-medium transition-colors duration-200 ${checks.special ? 'text-accent' : 'text-muted/60'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${checks.special ? 'bg-fresh shadow-[0_0_6px_#52b788]' : 'bg-muted/30'}`}></span> At least 1 special symbol
                      </li>
                    </ul>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-semibold text-primary" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 text-muted/65 pointer-events-none" size={20} />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`w-full rounded-sm border bg-white pl-12 pr-12 py-2 text-sm text-dark outline-none transition-all duration-200 placeholder:text-muted/70 focus:border-fresh focus:ring-4 focus:ring-sage ${errors.confirmPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-red-100 bg-red-50/10' : 'border-border'}`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute right-4 text-muted/60 hover:text-primary transition-colors focus:outline-none"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="text-[11px] text-red-600 mt-1 font-semibold">{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* Agree to terms */}
              <div className="flex flex-col items-start gap-1 mt-1">
                <label className="relative flex items-center gap-2.5 text-[11px] font-medium text-muted cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border accent-accent cursor-pointer"
                  />
                  I agree to the <a href="#terms" className="font-semibold text-accent hover:text-primary transition-colors">Terms of Service</a> & <a href="#privacy" className="font-semibold text-accent hover:text-primary transition-colors">Privacy Policy</a>
                </label>
                {errors.agreeTerms && <span className="text-[11px] text-red-600 mt-1 font-semibold">{errors.agreeTerms}</span>}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="mt-2 py-2 rounded-lg text-sm font-bold btn btn-primary w-full disabled:pointer-events-none disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>

            <div className="mt-2.5 text-center text-xs text-muted font-medium">
              <p>Already have an account? <Link to="/login" className="font-bold text-accent hover:text-primary transition-colors ml-1">Log In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
