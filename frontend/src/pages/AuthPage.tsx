import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiBase } from '../lib/api'

type AuthMode = 'login' | 'register'

type AuthResponse = {
  accessToken?: string
  user?: { id: string; email: string; role: string }
  message?: string | string[]
}

const API_BASE = getApiBase()

async function parseBody<T>(response: Response): Promise<T | undefined> {
  const raw = await response.text()
  if (!raw.trim()) return undefined

  try {
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

export function AuthPage() {
  const navigate = useNavigate()
  // Form mode (login vs register)
  const [mode, setMode] = useState<AuthMode>('login')
  const [lightsOn, setLightsOn] = useState(false)
  const [beamPulse, setBeamPulse] = useState(false)

  // Simple inputs
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState<AuthResponse | null>(null)
  const [touched, setTouched] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const endpoint = useMemo(
    () => `${API_BASE}/auth/${mode === 'login' ? 'login' : 'register'}`,
    [mode],
  )

  // Basic validation rules (beginner-friendly)
  const usernameError = !username.trim()
    ? 'Username is required.'
    : username.trim().length < 3
      ? 'Username must be at least 3 characters.'
      : /\s/.test(username)
        ? 'Username cannot include spaces.'
        : null

  const passwordError = !password
    ? 'Password is required.'
    : password.length < 6
      ? 'Password must be at least 6 characters.'
      : null

  const canSubmit = !usernameError && !passwordError && !loading

  useEffect(() => {
    const token = localStorage.getItem('store_token')
    if (!token) {
      setIsAuthenticated(false)
      return
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setIsAuthenticated(response.ok)
      })
      .catch(() => {
        setIsAuthenticated(false)
      })
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    setError(null)
    setResult(null)
    setSuccess(false)

    if (!canSubmit) return

    setLoading(true)

    try {
      // Our backend expects "email", so we map username -> email for now.
      const payload =
        mode === 'login'
          ? { email: username, password }
          : { email: username, password, role }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await parseBody<AuthResponse>(response)
      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(', ')
          : data?.message ?? `Request failed (HTTP ${response.status})`
        throw new Error(message)
      }
      if (!data) {
        throw new Error('Server returned an empty response')
      }

      setResult(data)
      setSuccess(true)

      if (data?.accessToken) {
        localStorage.setItem('store_token', data.accessToken)
        setIsAuthenticated(true)
        navigate('/', { replace: true })
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode(next: AuthMode) {
    setMode(next)
    setError(null)
    setResult(null)
    setSuccess(false)
    setTouched(false)
  }

  // Turn the lamp off after a short celebration.
  useEffect(() => {
    if (!success) return
    const timer = window.setTimeout(() => setSuccess(false), 2500)
    return () => window.clearTimeout(timer)
  }, [success])

  // Short light beam animation when the room turns on.
  useEffect(() => {
    if (!beamPulse) return
    const timer = window.setTimeout(() => setBeamPulse(false), 900)
    return () => window.clearTimeout(timer)
  }, [beamPulse])

  function toggleLights(nextState: boolean) {
    setLightsOn(nextState)
    if (nextState) setBeamPulse(true)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky via-lilac to-blush px-4 py-8 text-ink sm:px-6 sm:py-10">
      {/* Dark room overlay until the lamp is turned on */}
      <div
        className={`dark-room ${lightsOn ? 'room-on' : 'room-off'}`}
        aria-hidden
      />
      {/* Floating particles in the dark room */}
      <div className="room-particles" aria-hidden>
        {Array.from({ length: 10 }).map((_, index) => (
          <span key={index} className={`spark spark-${index + 1}`} />
        ))}
      </div>

      <div className="relative z-20 mx-auto grid w-full max-w-6xl gap-6 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left column: hero content + cute lamp */}
        <section className="order-2 flex flex-col justify-center gap-6 sm:gap-8 lg:order-1">
          <div className="inline-flex w-fit items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-ink shadow-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-mint" />
            Cute Store Portal
          </div>

          <h1 className="text-3xl font-bold leading-tight text-night sm:text-5xl">
            Welcome back. Let's light up your store.
          </h1>
          <p className="max-w-xl text-base text-ink/70 sm:text-lg">
            Pastel vibes, gentle animations, and a friendly login flow. Hover the
            lamp to see it glow. Submit successfully to turn it on.
          </p>

          <div className="hidden items-center gap-8 sm:flex">
            <div
              className="lamp group cursor-pointer"
              data-state={success || lightsOn ? 'on' : 'off'}
              onClick={() => toggleLights(!lightsOn)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  toggleLights(!lightsOn)
                }
              }}
            >
              <div className={`lamp-beam ${beamPulse ? 'beam-on' : ''}`} />
              <div className="lamp-glow" />
              <div className="lamp-shade" />
              <div className="lamp-bulb" />
              <div className="lamp-stand" />
              <div className="lamp-base" />
            </div>

            <div className="rounded-3xl bg-white/70 px-6 py-4 text-sm text-ink/70 shadow-soft">
              <p className="font-semibold text-ink">API Status</p>
              <p className="mt-1">Connected to: {API_BASE}</p>
            </div>
          </div>

          <div className="hidden flex-wrap items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={() => toggleLights(!lightsOn)}
              className="w-fit rounded-full bg-night px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
            >
              {lightsOn ? 'Turn off the lamp' : 'Turn on the lamp to enter'}
            </button>
            <span className="text-sm text-ink/60">
              Click the lamp or press Enter to toggle.
            </span>
          </div>
        </section>

        {/* Right column: form card */}
        <section className="order-1 flex items-center lg:order-2">
          <div
            className={`w-full rounded-[28px] bg-white/80 p-6 shadow-soft backdrop-blur transition duration-300 sm:rounded-[32px] sm:p-8 ${
              lightsOn ? 'opacity-100' : 'pointer-events-none opacity-30 blur-sm'
            }`}
          >
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-mint/50 px-4 py-3 text-sm text-ink">
                  <p className="font-semibold">You are already logged in.</p>
                  <p className="mt-1 text-xs text-ink/70">
                    Login and register options are hidden while authenticated.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Link
                    to="/"
                    className="rounded-2xl bg-mint px-4 py-3 text-center text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    Go to Products
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('store_token')
                      setIsAuthenticated(false)
                      setResult(null)
                      setSuccess(false)
                    }}
                    className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 flex rounded-full bg-white/70 p-1">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      mode === 'login'
                        ? 'bg-peach text-ink shadow'
                        : 'text-ink/60 hover:text-ink'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      mode === 'register'
                        ? 'bg-peach text-ink shadow'
                        : 'text-ink/60 hover:text-ink'
                    }`}
                  >
                    Register
                  </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Username input */}
                  <div>
                    <label className="text-sm font-semibold text-ink">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="yourname@store.com"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      onBlur={() => setTouched(true)}
                      className="mt-2 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-ink placeholder:text-ink/40 focus:border-peach focus:outline-none"
                    />
                    {touched && usernameError ? (
                      <p className="mt-1 text-xs font-medium text-rose-500">
                        {usernameError}
                      </p>
                    ) : null}
                  </div>

                  {/* Password input */}
                  <div>
                    <label className="text-sm font-semibold text-ink">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onBlur={() => setTouched(true)}
                      className="mt-2 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-ink placeholder:text-ink/40 focus:border-peach focus:outline-none"
                    />
                    {touched && passwordError ? (
                      <p className="mt-1 text-xs font-medium text-rose-500">
                        {passwordError}
                      </p>
                    ) : null}
                  </div>

                  {/* Role is locked to CUSTOMER in the UI for safety */}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full rounded-2xl bg-mint px-4 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? 'Working...'
                      : mode === 'login'
                        ? 'Sign In'
                        : 'Create Account'}
                  </button>

                  {error ? (
                    <div className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-600">
                      {error}
                    </div>
                  ) : null}

                  {result ? (
                    <div className="rounded-2xl bg-mint/50 px-4 py-3 text-sm text-ink">
                      <p className="font-semibold">Success! Lamp is on.</p>
                      {result.user ? (
                        <p className="mt-1 text-xs text-ink/70">
                          {result.user.email} | {result.user.role}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
