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
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-medium text-gray-900 mb-2">Créer un compte</h1>
        <p className="text-sm text-gray-500 mb-6">Essai gratuit 30 jours · Sans carte bancaire</p>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nom de votre entreprise"
            value={form.companyName}
            onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Votre nom complet"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email professionnel"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Mot de passe (8 caractères min)"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer mon compte gratuitement'}
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}