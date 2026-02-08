import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState, type ReactElement } from 'react'
import { apiGet } from './lib/api'
import { Navbar } from './components/Navbar'
import { AuthPage } from './pages/AuthPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { OrdersPage } from './pages/OrdersPage'
import { AdminPage } from './pages/AdminPage'

type ThemeMode = 'dark' | 'light'
type AuthState = 'checking' | 'authenticated' | 'unauthenticated'

function App() {
  const location = useLocation()
  const isAuthRoute = location.pathname.startsWith('/auth')
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('store_theme')
    return saved === 'light' ? 'light' : 'dark'
  })
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authState, setAuthState] = useState<AuthState>('checking')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('store_theme', theme)
  }, [theme])

  useEffect(() => {
    const token = localStorage.getItem('store_token')
    if (!token) {
      setUser(null)
      setAuthError('Not logged in')
      setAuthState('unauthenticated')
      return
    }

    let cancelled = false
    setAuthState('checking')
    apiGet<{ email: string; role: string }>('/auth/me', true)
      .then((data) => {
        if (cancelled) return
        setUser(data)
        setAuthError(null)
        setAuthState('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        localStorage.removeItem('store_token')
        setUser(null)
        setAuthError('Not logged in')
        setAuthState('unauthenticated')
      })

    return () => {
      cancelled = true
    }
  }, [location.pathname])

  function logout() {
    localStorage.removeItem('store_token')
    setUser(null)
    setAuthError('Not logged in')
    setAuthState('unauthenticated')
  }

  const loadingView = (
    <div className="mx-auto mt-20 w-full max-w-6xl px-6 text-center text-sm text-white/70">
      Checking your session...
    </div>
  )

  function protectedElement(element: ReactElement) {
    if (authState === 'checking') return loadingView
    if (authState !== 'authenticated') return <Navigate to="/auth" replace />
    return element
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'theme-dark bg-slate-950 text-white' : 'theme-light bg-slate-100 text-slate-900'
      }`}
    >
      {!isAuthRoute && authState === 'authenticated' ? (
        <Navbar
          user={user}
          authLabel={authError}
          onLogout={logout}
          theme={theme}
          onToggleTheme={() =>
            setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
          }
        />
      ) : null}

      <main className="min-h-[calc(100vh-72px)]">
        <Routes>
          <Route path="/" element={protectedElement(<ProductsPage />)} />
          <Route
            path="/products/:id"
            element={protectedElement(<ProductDetailPage />)}
          />
          <Route path="/cart" element={protectedElement(<CartPage />)} />
          <Route path="/orders" element={protectedElement(<OrdersPage />)} />
          <Route path="/admin" element={protectedElement(<AdminPage />)} />
          <Route
            path="/auth"
            element={
              authState === 'checking'
                ? loadingView
                : authState === 'authenticated'
                  ? <Navigate to="/" replace />
                  : <AuthPage />
            }
          />
          <Route
            path="*"
            element={
              <Navigate
                to={authState === 'authenticated' ? '/' : '/auth'}
                replace
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
