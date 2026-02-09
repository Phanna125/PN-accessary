import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

type UserInfo = { email: string; role: string } | null

type NavbarProps = {
  user: UserInfo
  authLabel?: string | null
  onLogout: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

function initials(email: string) {
  const base = email.split('@')[0] ?? email
  const letters = base.replace(/[^a-zA-Z]/g, '').toUpperCase()
  if (letters.length >= 2) return letters.slice(0, 2)
  return base.slice(0, 2).toUpperCase()
}

export function Navbar({
  user,
  authLabel,
  onLogout,
  theme,
  onToggleTheme,
}: NavbarProps) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const showAdmin = user?.role === 'ADMIN'

  const navItems = [
    { to: '/', label: 'Products' },
    { to: '/cart', label: 'Cart' },
    { to: '/orders', label: 'Orders' },
    ...(showAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const shellClasses =
    theme === 'dark'
      ? 'border-slate-700/70 bg-slate-900/85 text-slate-100'
      : 'border-[#d9dee8] bg-[#f8fafc]/95 text-slate-800'

  const navIdleClasses =
    theme === 'dark'
      ? 'text-slate-300 hover:text-white hover:bg-slate-700/70'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'

  const navActiveClasses =
    theme === 'dark'
      ? 'bg-slate-700 text-white'
      : 'bg-slate-900 text-white'

  const pillClasses =
    theme === 'dark'
      ? 'border-slate-700 bg-slate-800/85 text-slate-200'
      : 'border-[#d9dee8] bg-white text-slate-700'

  const brandTitleClasses = theme === 'dark' ? 'text-white' : 'text-slate-900'
  const brandSubClasses = theme === 'dark' ? 'text-slate-300' : 'text-slate-500'
  const accountShellClasses =
    theme === 'dark'
      ? 'border-slate-700 bg-slate-800/85 text-slate-200'
      : 'border-[#d9dee8] bg-white text-slate-600'
  const accountBadgeClasses =
    theme === 'dark'
      ? 'bg-slate-700 text-slate-100'
      : 'bg-[#f3e9de] text-slate-700'
  const logoutClasses =
    theme === 'dark'
      ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur ${shellClasses}`}>
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src="/pn-logo-mark.svg"
              alt="PN-Accessory logo"
              className="h-10 w-10 rounded-2xl object-cover shadow-[0_8px_16px_rgba(32,41,56,0.35)]"
            />
            <div className="leading-none">
              <p className={`font-display text-[2rem] ${brandTitleClasses}`}>PN-Accessory</p>
              <p className={`text-[11px] ${brandSubClasses}`}>store dashboard</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-2 transition ${
                      isActive ? navActiveClasses : navIdleClasses
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${pillClasses}`}
            >
              {theme === 'dark' ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
                </svg>
              )}
            </button>

            {user ? (
              <div className={`flex min-w-0 items-center gap-2 rounded-full border px-2 py-1 text-xs ${accountShellClasses}`}>
                <div className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${accountBadgeClasses}`}>
                  {initials(user.email)}
                </div>
                <span className="max-w-[200px] truncate">{user.role}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${logoutClasses}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-500">{authLabel ?? 'Not logged in'}</span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${pillClasses}`}
            >
              {theme === 'dark' ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${pillClasses}`}
            >
              {mobileOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="mt-3 grid gap-2 sm:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive ? navActiveClasses : navIdleClasses
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {user ? (
              <div className={`mt-1 flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${accountShellClasses}`}>
                <span>{user.role}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${logoutClasses}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-500">{authLabel ?? 'Not logged in'}</span>
            )}
          </div>
        ) : null}
      </div>
    </header>
  )
}
