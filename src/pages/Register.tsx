import { useState } from 'react'
import api from '../lib/api'

export default function Register() {
  const [form, setForm] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', form)
      localStorage.setItem('token', res.data.token)
      window.location.href = '/planning'
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ts-bg)' }}>
      <div className="rounded-xl border p-8 w-full max-w-sm" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
        <h1 className="text-xl font-medium mb-2" style={{ color: 'var(--ts-text)' }}>Créer un compte</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--ts-text-2)' }}>Essai gratuit 30 jours · Sans carte bancaire</p>
        {error && <p className="text-sm mb-4" style={{ color: 'var(--ts-red)' }}>{error}</p>}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nom de votre entreprise"
            value={form.companyName}
            onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
          />
          <input
            type="text"
            placeholder="Votre nom complet"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
          />
          <input
            type="email"
            placeholder="Email professionnel"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
          />
          <input
            type="password"
            placeholder="Mot de passe (8 caractères min)"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
          />
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
          >
            {loading ? 'Création...' : 'Créer mon compte gratuitement'}
          </button>
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--ts-text-2)' }}>
          Déjà un compte ?{' '}
          <a href="/login" style={{ color: 'var(--ts-accent)' }}>
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}
