import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import UserMenu from '../components/UserMenu';
import logoImage from '../assets/awf_header_logo_premium.svg';

export default function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'text-copper-600'
        : 'text-navy-700 hover:text-copper-600'
    }`;

  const closeMenu = () => setMobileMenuOpen(false);

  const navLinks = [
    { to: '/building-blocks', label: 'Building Blocks' },
    { to: '/financial-pillars', label: 'Financial Pillars' },
    { to: '/foundation-score', label: 'Foundation Score' },
    { to: '/premium', label: 'Premium' },
    { to: '/articles', label: 'Articles' },
    { to: '/trusted-experts', label: 'Trusted Experts' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between sm:h-16">
            <div className="flex items-center gap-8">
            <Link
  to="/"
  className="flex items-center transition hover:opacity-90"
  onClick={closeMenu}
>
  <img
    src={logoImage}
    alt="A Wealthy Foundation"
    className="h-15 w-auto"
  />
</Link>

              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={navLinkClass(link.to)}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <UserMenu />
            </div>

            <button
              type="button"
              aria-label="Toggle menu"
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-slate-200 py-4 md:hidden">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
                      location.pathname === link.to
                        ? 'bg-amber-50 text-copper-600'
                        : 'text-navy-700 hover:bg-slate-50 hover:text-copper-600'
                    }`}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <UserMenu />
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}