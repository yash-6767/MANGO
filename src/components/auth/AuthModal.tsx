import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email || !password) {
          setErrorMsg('Please enter both email and password.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password should be at least 6 characters.');
          setLoading(false);
          return;
        }
        const res = await authService.signUp(email, password, fullName);
        if (res.error) {
          setErrorMsg(res.error.message);
        } else {
          setSuccessMsg('Account created successfully! Welcome to MANGOS.');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1200);
        }
      } else if (mode === 'signin') {
        const res = await authService.signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error.message);
        } else {
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 800);
        }
      } else if (mode === 'forgot') {
        if (!email) {
          setErrorMsg('Please enter your email address.');
          setLoading(false);
          return;
        }
        const res = await authService.resetPassword(email);
        if (res.error) {
          setErrorMsg(res.error.message);
        } else {
          setSuccessMsg('Password recovery instructions sent to your email.');
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl sm:p-8 text-[var(--text-main)] my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sage-soft)] text-[var(--emerald-primary)] shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-[var(--text-main)]">
            {mode === 'signin' && 'Welcome back to MANGOS'}
            {mode === 'signup' && 'Create your MANGOS account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {mode === 'signin' && 'Sign in to access your personal roadmaps and sync your progress.'}
            {mode === 'signup' && 'Start your career preparation journey with personal progress tracking.'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Tab switchers */}
        {mode !== 'forgot' && (
          <div className="flex rounded-xl bg-[var(--bg-secondary)] p-1 border border-[var(--border-color)] mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                mode === 'signin'
                  ? 'bg-[var(--bg-card)] text-[var(--emerald-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                mode === 'signup'
                  ? 'bg-[var(--bg-card)] text-[var(--emerald-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Davis"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] py-2.5 pl-10 pr-3.5 text-xs font-semibold text-[var(--text-main)] outline-none focus:border-[var(--emerald-primary)] focus:bg-[var(--bg-card)]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] py-2.5 pl-10 pr-3.5 text-xs font-semibold text-[var(--text-main)] outline-none focus:border-[var(--emerald-primary)] focus:bg-[var(--bg-card)]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--sage-dark)]">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-semibold text-[var(--emerald-primary)] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] py-2.5 pl-10 pr-3.5 text-xs font-semibold text-[var(--text-main)] outline-none focus:border-[var(--emerald-primary)] focus:bg-[var(--bg-card)]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--emerald-primary)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--emerald-deep)] disabled:opacity-40 shadow-sm mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'signin' ? (
              'Sign In'
            ) : mode === 'signup' ? (
              'Create Account'
            ) : (
              'Send Recovery Link'
            )}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className="w-full text-center text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] mt-2"
            >
              Back to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
