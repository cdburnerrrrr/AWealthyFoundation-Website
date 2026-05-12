import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import logoImage from '../assets/awf_logo_mobile.svg';

type Mode = 'signIn' | 'signUp';

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
    mode === 'signIn'
      ? message
        ? 'Confirm your email, then sign in to access your dashboard.'
        : 'Sign in to access your dashboard.'
      : 'Create your account to start building your foundation.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl border border-copper-300/25 bg-white shadow-xl shadow-copper-500/10">
            <img
              src={logoImage}
              alt="A Wealthy Foundation"
              className="h-20 w-auto"
            />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {mode === 'signIn' ? 'Welcome back' : 'Start your foundation'}
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
            Access your Foundation Score, dashboard, reports, and tools.
          </p>

          <p className="mt-2 text-sm text-slate-400">{eyebrowText}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-white/10">
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signIn');
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
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-copper-500 focus:ring-2 focus:ring-copper-200"
                placeholder="••••••••"
              />
            </div>

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
                ? mode === 'signIn'
                  ? 'Signing In...'
                  : 'Creating Account...'
                : mode === 'signIn'
                  ? 'Sign In'
                  : 'Create Account'}
            </button>
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
