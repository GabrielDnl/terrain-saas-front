import { useState } from 'react'
import api from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      window.location.href = '/planning'
    } catch {
      setError('Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ts-bg)' }}>
      <div className="rounded-xl border p-8 w-full max-w-sm" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
        <h1 className="text-xl font-medium mb-6" style={{ color: 'var(--ts-text)' }}>Connexion</h1>
        {error && <p className="text-sm mb-4" style={{ color: 'var(--ts-red)' }}>{error}</p>}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--ts-text-2)' }}>
          Pas encore de compte ?{' '}
          <a href="/register" style={{ color: 'var(--ts-accent)' }}>
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  )
}
