import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Leaf } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer'); // 'buyer', 'farmer', or 'admin'
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setEmail('admin@agrimarket.com');
      setPassword('admin123');
      setErrors({});
    } else {
      setEmail('');
      setPassword('');
      setErrors({});
    }
  };

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
    <div className="w-screen h-screen overflow-hidden font-sans bg-[#f8faf9] m-0 p-0">
      <div className="w-full h-full flex overflow-hidden">
        
        {/* Left Side: Graphic & Marketing Info (Visible on Desktop) */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 lg:p-16 text-white overflow-hidden h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-[#123524]/95 to-[#1e5c3f]/95 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1000&fm=jpg" 
            alt="Organic farming fresh produce" 
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
                Trade directly. <br />Earn better. <br />Eat fresher.
              </h1>
              <p className="text-sm lg:text-base text-white/80 leading-relaxed font-medium">
                Connecting verified farmers directly with wholesale buyers and consumers with secure escrow payments.
              </p>
            </div>

            <div className="text-xs font-medium text-white/50">
              <span>&copy; AgriMarket</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-16 bg-[#f8faf9] overflow-y-auto h-full custom-scrollbar">
          <div className="w-full max-w-[440px] flex flex-col bg-white p-8 sm:p-10 rounded-md shadow-lg border border-glass-border animate-fade-in-up">
            <Link to="/" className="mb-6 flex items-center gap-1.5 text-xs font-bold text-accent hover:text-primary transition-colors focus:outline-none">
              <ArrowLeft size={16} /> Back to home
            </Link>
            <div className="mb-4">
              <div className="flex md:hidden items-center gap-1.5 text-xl font-extrabold text-primary mb-4">
                <Leaf className="text-fresh" size={24} />
                <span>Agri<span className="text-fresh">Market</span></span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight mb-2">Welcome Back</h2>
              <p className="text-sm text-muted leading-normal">Enter your credentials to manage your agricultural trade</p>
            </div>

            {/* Role selector buttons */}
            <div className="flex p-1 bg-sage/40 rounded-full mb-4 border border-glass-border">
              <button 
                type="button" 
                className={`flex-1 py-2 text-sm font-bold rounded-full transition-all duration-200 focus:outline-none ${role === 'buyer' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                onClick={() => handleRoleChange('buyer')}
              >
                Buyer
              </button>
              <button 
                type="button" 
                className={`flex-1 py-2 text-sm font-bold rounded-full transition-all duration-200 focus:outline-none ${role === 'farmer' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                onClick={() => handleRoleChange('farmer')}
              >
                Farmer
              </button>
              <button 
                type="button" 
                className={`flex-1 py-2 text-sm font-bold rounded-full transition-all duration-200 focus:outline-none ${role === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                onClick={() => handleRoleChange('admin')}
              >
                Admin
              </button>
            </div>

            {role === 'admin' && (
              <p className="text-center text-xs text-fresh font-semibold mb-4 bg-sage/20 py-2 rounded-sm">
                Default Admin Credentials pre-filled.
              </p>
            )}

            {submitMessage && (
              <div className={`p-3.5 rounded-sm text-sm font-semibold mb-4 text-left border ${submitMessage.includes('Successfully') ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Email Input */}
              <div className="flex flex-col">
                <label className="block mb-2 text-sm font-semibold text-primary" htmlFor="email">Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 text-muted/65 pointer-events-none" size={20} />
                  <input
                    id="email"
                    type="email"
                    className={`w-full rounded-sm border bg-white pl-12 pr-4 py-2 text-sm text-dark outline-none transition-all duration-200 placeholder:text-muted/70 focus:border-fresh focus:ring-4 focus:ring-sage ${errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-100 bg-red-50/10' : 'border-border'}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <span className="text-xs text-red-600 mt-1.5 font-semibold">{errors.email}</span>}
              </div>

              {/* Password Input */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <label className="block mb-2 text-sm font-semibold text-primary" htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-accent hover:text-primary transition-colors">Forgot password?</Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-muted/65 pointer-events-none" size={20} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full rounded-sm border bg-white pl-12 pr-12 py-2 text-sm text-dark outline-none transition-all duration-200 placeholder:text-muted/70 focus:border-fresh focus:ring-4 focus:ring-sage ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-100 bg-red-50/10' : 'border-border'}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {errors.password && <span className="text-xs text-red-600 mt-1.5 font-semibold">{errors.password}</span>}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between mt-1">
                <label className="relative flex items-center gap-2.5 text-xs font-medium text-muted cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-accent cursor-pointer"
                  />
                  Remember me on this device
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="mt-2 py-2 rounded-lg text-sm font-bold btn btn-primary w-full disabled:pointer-events-none disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying Account...' : `Log In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
              </button>
            </form>

            <div className="mt-3 text-center text-xs text-muted font-medium">
              <p>Don't have an account? <Link to="/signup" className="font-bold text-accent hover:text-primary transition-colors ml-1">Sign Up Now</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
