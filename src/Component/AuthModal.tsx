import { useState, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type AuthMode = 'sign-in' | 'sign-up';

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setEmail('');
    setPassword('');
    setError(null);
    setMessage(null);
    setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const switchMode = useCallback(() => {
    setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'));
    setError(null);
    setMessage(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: err } =
      mode === 'sign-in'
        ? await signIn(email, password)
        : await signUp(email, password);

    if (err) {
      setError(err);
    } else if (mode === 'sign-in') {
      onClose();
      reset();
    } else {
      setMessage('Check your email for a confirmation link to complete sign up.');
      setMode('sign-in');
    }

    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-surface border border-glass-border shadow-2xl overflow-hidden animate-slide-up">
        {/* Handle bar (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-text-dim/30" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-all duration-200 active:scale-90"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 pb-6 pt-4 sm:pt-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text">
              {mode === 'sign-in' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {mode === 'sign-in'
                ? 'Sign in to save your favourite spots'
                : 'Join YodaChain to never lose your way'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-text-muted mb-1.5">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@unilorin.edu.ng"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-glass-border text-text text-sm placeholder:text-text-dim/50
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                autoComplete={mode === 'sign-in' ? 'email' : 'email'}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-text-muted mb-1.5">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-glass-border text-text text-sm placeholder:text-text-dim/50
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              />
            </div>

            {/* Error / Message */}
            {error && (
              <div className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                {error}
              </div>
            )}
            {message && (
              <div className="px-3.5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs text-center">
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-bg font-semibold text-sm
                hover:brightness-110 active:scale-[0.97] transition-all duration-150 ease-out
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'sign-in' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                mode === 'sign-in' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-xs text-text-muted mt-5">
            {mode === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="text-primary font-medium hover:underline"
            >
              {mode === 'sign-in' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}