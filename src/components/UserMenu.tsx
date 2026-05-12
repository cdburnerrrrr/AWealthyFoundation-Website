import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Lock, LogOut, Star, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/appStore';

export default function UserMenu() {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    isAuthenticated,
    user,
    currentAssessment,
    setAuth,
    setUser,
    setCurrentAssessment,
    setAssessmentHistory,
  } = useAppStore();

  const [open, setOpen] = useState(false);

  const foundationScore = useMemo(() => {
    if (!currentAssessment) return null;

    return (
      currentAssessment.foundationScore ??
      currentAssessment.score ??
      currentAssessment.foundation_score ??
      null
    );
  }, [currentAssessment]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } finally {
      setAuth(false, false);
      setUser(null);
      setCurrentAssessment(null);
      setAssessmentHistory([]);
      setOpen(false);
      navigate('/');
    }
  }

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => navigate('/login')}
        className="inline-flex items-center gap-2 rounded-full border border-copper-200 bg-white px-3 py-2 text-sm font-semibold text-copper-700 shadow-sm transition hover:border-copper-300 hover:bg-copper-50"
      >
        <User size={18} />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-copper-200 bg-copper-50 px-1.5 text-copper-700 shadow-sm transition hover:border-copper-300 hover:bg-copper-100"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-copper-600 text-white shadow-sm shadow-copper-600/20">
          <User size={17} />
        </span>

        <ChevronDown size={16} className={`mr-1 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-copper-50 text-copper-700 ring-1 ring-copper-200">
                <User size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">Your Account</p>
                <p className="truncate text-sm text-slate-500">
                  {user?.email || 'Signed in'}
                </p>
              </div>
            </div>

            {foundationScore !== null && foundationScore !== undefined && (
              <div className="mt-4 rounded-xl bg-copper-50 px-3 py-3 ring-1 ring-copper-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-copper-800">
                  Foundation Score
                </p>
                <p className="mt-1 text-2xl font-bold text-copper-700">
                  {foundationScore}
                </p>
              </div>
            )}
          </div>

          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                navigate('/my-foundation');
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-copper-50 hover:text-copper-700"
            >
              <User size={16} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigate('/premium');
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-copper-50 hover:text-copper-700"
            >
              <Star size={16} />
              <span>Premium Plans</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigate('/login');
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <Lock size={16} />
              <span>Account</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
