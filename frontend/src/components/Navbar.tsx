import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

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
    ...(!user ? [{ to: '/auth', label: 'Login / Register' }] : []),
  ]

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const headerClasses =
    theme === 'dark'
      ? 'border-white/10 bg-slate-950/80'
      : 'border-slate-300/80 bg-white/80'
  const textClasses = theme === 'dark' ? 'text-white/70' : 'text-slate-600'
  const mutedClasses = theme === 'dark' ? 'text-white/60' : 'text-slate-600'

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur transition-colors ${headerClasses}`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div
            className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            Store UI
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                theme === 'dark'
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-slate-900/10 text-slate-700 hover:bg-slate-900/20'
              }`}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition sm:hidden ${
                theme === 'dark'
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-slate-900/10 text-slate-700 hover:bg-slate-900/20'
              }`}
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

        <div className="mt-3 hidden items-center justify-between gap-4 sm:flex">
          <nav className={`flex flex-wrap items-center gap-2 text-sm font-medium ${textClasses}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 transition ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-900/10 text-slate-900'
                      : theme === 'dark'
                        ? 'text-white/60 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={`flex min-w-0 items-center gap-3 text-xs ${mutedClasses}`}>
            {user ? (
              <>
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      theme === 'dark'
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-900/10 text-slate-900'
                    }`}
                  >
                    {initials(user.email)}
                  </div>
                  <span className="max-w-[240px] truncate">
                    <span className="inline-block select-none blur-[4px]">
                      {user.email}
                    </span>{' '}
                    | {user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className={`rounded-full px-3 py-1 transition ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white/70 hover:bg-white/20'
                      : 'bg-slate-900/10 text-slate-700 hover:bg-slate-900/20'
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <span>{authLabel ?? 'Not logged in'}</span>
            )}
          </div>
        </div>

        {mobileOpen ? (
          <div className="mt-3 grid gap-3 sm:hidden">
            <nav className={`grid gap-2 text-sm font-medium ${textClasses}`}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 transition ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-white/15 text-white'
                          : 'bg-slate-900/10 text-slate-900'
                        : theme === 'dark'
                          ? 'text-white/70 hover:text-white hover:bg-white/10'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-900/10'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div
              className={`rounded-xl border px-3 py-3 text-xs ${
                theme === 'dark'
                  ? 'border-white/10 bg-white/5 text-white/70'
                  : 'border-slate-300 bg-slate-900/5 text-slate-700'
              }`}
            >
              {user ? (
                <div className="grid gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                        theme === 'dark'
                          ? 'bg-white/15 text-white'
                          : 'bg-slate-900/10 text-slate-900'
                      }`}
                    >
                      {initials(user.email)}
                    </div>
                    <span className="truncate">
                      <span className="inline-block select-none blur-[4px]">
                        {user.email}
                      </span>{' '}
                      | {user.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      theme === 'dark'
                        ? 'bg-white/10 text-white/80 hover:bg-white/20'
                        : 'bg-slate-900/10 text-slate-700 hover:bg-slate-900/20'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <span>{authLabel ?? 'Not logged in'}</span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
