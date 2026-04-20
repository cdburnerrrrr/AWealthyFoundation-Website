import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import UserMenu from '../components/UserMenu';
import logoDesktop from '../assets/awf_logo_desktop.svg';
import logoMobile from '../assets/awf_logo_mobile.svg';

export default function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = (path: string) =>
    `relative text-sm font-medium transition-all duration-200 ${
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
    { to: '/foundation-tools', label: 'Foundation Tools' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between gap-3 sm:h-[74px]">
        <div className="flex min-w-0 items-center gap-4 lg:gap-5">
            <Link
  to="/"
  className="flex items-center gap-1 transition hover:opacity-90"
  onClick={closeMenu}
>
  <picture>
    <source media="(max-width: 640px)" srcSet={logoMobile} />

    <img
      src={logoDesktop}
      alt="A Wealthy Foundation"
      className="block h-12 w-auto sm:h-[56px] lg:h-[64px] -translate-y-[1px]"
    />
  </picture>
</Link>

<nav className="hidden md:flex items-center gap-3 lg:gap-5 xl:gap-6">
                {navLinks.map((link) => (
                  <Link
                  key={link.to}
                  to={link.to}
                  className={`${navLinkClass(link.to)} group`}
                  onClick={closeMenu}
                >
                  <span className="relative">
                    {link.label}
                
                    {/* underline */}
                    <span
                      className={`absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 bg-copper-600 transition-transform duration-200 group-hover:scale-x-100 ${
                        location.pathname === link.to ? 'scale-x-100' : ''
                      }`}
                    />
                  </span>
                </Link>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex shrink-0 items-center">
              <UserMenu />
            </div>

            <button
              type="button"
              aria-label="Toggle menu"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 md:hidden"
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
