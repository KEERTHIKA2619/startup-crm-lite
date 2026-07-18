import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, Sparkles, Eye, EyeOff } from 'lucide-react';

/**
 * Registration view for Startup CRM Lite.
 */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validations
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      // Success redirect to dashboard
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md bg-bg-surface border border-border-base rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6 slide-up">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2 shadow-sm">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl text-text-main tracking-tight">
            Create an account
          </h1>
          <p className="text-xs text-text-muted">
            Start managing your startup pipeline efficiently.
          </p>
        </div>

        {/* Form Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-text-subtle" />
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={isSubmitting}
              className="w-full h-10 px-3 rounded-xl border border-border-base bg-bg-surface text-text-main text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-text-subtle" />
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isSubmitting}
              className="w-full h-10 px-3 rounded-xl border border-border-base bg-bg-surface text-text-main text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-text-subtle" />
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                disabled={isSubmitting}
                className="w-full h-10 pl-3 pr-10 rounded-xl border border-border-base bg-bg-surface text-text-main text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-main focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="reg-confirm" className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-text-subtle" />
              Confirm Password
            </label>
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              disabled={isSubmitting}
              className="w-full h-10 px-3 rounded-xl border border-border-base bg-bg-surface text-text-main text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
              required
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 mt-2 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-primary/20 transition-all active:scale-[0.99] disabled:opacity-75 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Sign Up
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center pt-2 border-t border-border-base/60">
          <p className="text-xs text-text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline hover:text-primary/90"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
