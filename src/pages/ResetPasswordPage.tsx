import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import logoImage from '../assets/awf_logo_desktop.svg';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const urlError = hashParams.get('error_description') || hashParams.get('error');

    if (urlError) {
      setError(urlError.replace(/\+/g, ' '));
      setCheckingSession(false);
      return;
    }

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setHasRecoverySession(Boolean(session?.user));
      setCheckingSession(false);
    }

    checkRecoverySession();
  }, []);

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError('Please choose a password that is at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage('Your password has been updated. Sending you to your dashboard...');
      setPassword('');
      setConfirmPassword('');

      window.setTimeout(() => {
        navigate('/my-foundation');
      }, 1200);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err?.message || 'Unable to reset password. Please request a new reset link.');
    } finally {
      setLoading(false);
    }
  }

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
            Reset your password
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
            Choose a new password for your A Wealthy Foundation account.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-white/10">
          {checkingSession ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Checking your reset link...
            </div>
          ) : hasRecoverySession ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-copper-500 focus:ring-2 focus:ring-copper-200"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
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
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This reset link is missing, invalid, or expired. Please request a new password reset email.
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full rounded-xl bg-copper-600 px-4 py-3 font-semibold text-white transition hover:bg-copper-700"
              >
                Back to Sign In
              </button>
            </div>
          )}
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
