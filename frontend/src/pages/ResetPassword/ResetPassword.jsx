import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Leaf, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
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
    <div className="w-screen h-screen overflow-hidden font-sans bg-[#f8faf9] m-0 p-0">
      <div className="w-full h-full flex overflow-hidden">
        
        {/* Left Side: Graphic & Marketing Info (Visible on Desktop) */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 lg:p-16 text-white overflow-hidden h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-[#123524]/95 to-[#1e5c3f]/95 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1000&auto=format&fit=crop&fm=jpg" 
            alt="Beautiful sunset farm field" 
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
                Forgot your details? <br />Recover your account <br />securely.
              </h1>
              <p className="text-sm lg:text-base text-white/80 leading-relaxed font-medium">
                Enter your email address to reset your password and continue trading.
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
            <Link to="/login" className="mb-6 flex items-center gap-1.5 text-xs font-bold text-accent hover:text-primary transition-colors focus:outline-none text-left">
              <ArrowLeft size={16} /> Back to Login
            </Link>
            
            <div className="flex flex-col items-center gap-4 text-center mb-6">
              <div className="flex md:hidden items-center gap-1.5 text-xl font-extrabold text-primary mb-2">
                <Leaf className="text-fresh" size={24} />
                <span>Agri<span className="text-fresh">Market</span></span>
              </div>
              
              {!isSuccess ? (
                <>
                  <h2 className="text-2xl font-extrabold text-primary tracking-tight">Reset Password</h2>
                  <p className="text-sm text-muted leading-relaxed max-w-[340px]">Enter the email address associated with your account, and we'll send you link instructions to reset your password.</p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 animate-fade-in-up">
                  <CheckCircle className="text-fresh animate-float" size={48} />
                  <h2 className="text-2xl font-extrabold text-primary tracking-tight">Check Your Email</h2>
                  <p className="text-sm text-muted leading-relaxed max-w-[340px]">We've sent a password reset link to: <br /><strong className="text-primary font-bold text-base mt-1 inline-block">{email}</strong></p>
                </div>
              )}
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
                {/* Email Address */}
                <div className="flex flex-col">
                  <label className="block mb-2 text-sm font-semibold text-primary" htmlFor="email">Email</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 text-muted/65 pointer-events-none" size={20} />
                    <input
                      id="email"
                      type="email"
                      className={`w-full rounded-sm border bg-white pl-12 pr-4 py-2 text-sm text-dark outline-none transition-all duration-200 placeholder:text-muted/70 focus:border-fresh focus:ring-4 focus:ring-sage ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-100 bg-red-50/10' : 'border-border'}`}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <span className="text-xs text-red-600 mt-1.5 font-semibold">{error}</span>}
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="py-3 font-bold text-base rounded-full btn btn-primary w-full disabled:pointer-events-none disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending instructions...' : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4 text-center animate-fade-in-up">
                <p className="text-xs text-muted leading-normal max-w-[320px] mx-auto">Did not receive the email? Check your spam filter or try again.</p>
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

            <div className="border-t border-border pt-4 mt-6 text-center text-xs font-semibold text-muted">
              <p>Remember your password? <Link to="/login" className="text-accent hover:text-primary transition-colors font-bold ml-1">Log In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
