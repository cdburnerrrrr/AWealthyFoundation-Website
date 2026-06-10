import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import logoImage from '../assets/awf_logo_desktop.svg';

type Mode = 'signIn' | 'signUp' | 'forgotPassword';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectPath = searchParams.get('redirect') || '/my-foundation';

  const [mode, setMode] = useState<Mode>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'forgotPassword') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        setMessage('Check your email for a password reset link.');
        return;
      }

      if (mode === 'signIn') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        window.setTimeout(() => {
          navigate(redirectPath);
        }, 100);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              name: name.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
          });

          if (profileError) {
            console.error('Profile upsert error:', profileError);
          }
        }

        if (data.user && !data.session) {
          setMode('signIn');
          setMessage(
            'Your account is created. Check your email to confirm, then come back here to sign in.'
          );
          setPassword('');
          return;
        }

        window.setTimeout(() => {
          navigate(redirectPath);
        }, 100);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  const eyebrowText =
    mode === 'forgotPassword'
      ? 'Enter your email and we’ll send you a secure password reset link.'
      : mode === 'signIn'
        ? message
          ? 'Confirm your email, then sign in to access your dashboard.'
          : 'Sign in to access your dashboard.'
        : 'Create your account to start building your foundation.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-[72px] w-[300px] items-center justify-center rounded-2xl bg-white px-4 py-2 shadow-xl shadow-copper-500/10 ring-1 ring-white/20 sm:h-[78px] sm:w-[340px]">
              <img
                src={logoImage}
                alt="A Wealthy Foundation"
                className="mx-auto block h-16 w-auto sm:h-[68px]"
              />
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {mode === 'forgotPassword' ? 'Reset your password' : mode === 'signIn' ? 'Welcome back' : 'Start your foundation'}
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
            Access your Foundation Score, dashboard, reports, and tools.
          </p>

          <p className="mt-2 text-sm text-slate-400">{eyebrowText}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-white/10">
          {mode !== 'forgotPassword' && (
            <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signIn');
                setPassword('');
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                mode === 'signIn'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signUp');
                setPassword('');
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                mode === 'signUp'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signUp' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-copper-500 focus:ring-2 focus:ring-copper-200"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-copper-500 focus:ring-2 focus:ring-copper-200"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {mode !== 'forgotPassword' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-copper-500 focus:ring-2 focus:ring-copper-200"
                  placeholder="••••••••"
                />
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-copper-600 px-4 py-3 font-semibold text-white transition hover:bg-copper-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? mode === 'forgotPassword'
                  ? 'Sending Reset Link...'
                  : mode === 'signIn'
                    ? 'Signing In...'
                    : 'Creating Account...'
                : mode === 'forgotPassword'
                  ? 'Send Reset Link'
                  : mode === 'signIn'
                    ? 'Sign In'
                    : 'Create Account'}
            </button>

            {mode === 'signIn' && (
              <button
                type="button"
                onClick={() => {
                  setMode('forgotPassword');
                  setPassword('');
                  setError(null);
                  setMessage(null);
                }}
                className="w-full text-center text-sm font-medium text-slate-500 transition-colors hover:text-copper-700"
              >
                Forgot your password?
              </button>
            )}

            {mode === 'forgotPassword' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signIn');
                  setPassword('');
                  setError(null);
                  setMessage(null);
                }}
                className="w-full text-center text-sm font-medium text-slate-500 transition-colors hover:text-copper-700"
              >
                Back to sign in
              </button>
            )}
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
