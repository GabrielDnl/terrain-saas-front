import { useState, useEffect } from 'react'
import api from '../lib/api'

export default function Profile() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    api.get(`/auth/me`).then(res => {
      setName(res.data.name)
      setEmail(res.data.email)
      setCompanyName(res.data.company)
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setError('')
    setSuccess('')
    try {
      await api.put('/auth/profile', {
        name: name || undefined,
        password: password || undefined,
      })
      setSuccess('Profil mis à jour')
      setPassword('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-medium mb-6" style={{ color: 'var(--ts-text)' }}>Mon profil</h1>

      <div className="rounded-xl p-6 space-y-4 border" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
        {success && (
          <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--ts-green-bg)', color: 'var(--ts-green-text)' }}>
            {success}
          </p>
        )}
        {error && <p className="text-sm" style={{ color: 'var(--ts-red)' }}>{error}</p>}

        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--ts-text-2)' }}>Entreprise</label>
          <input
            type="text"
            value={companyName}
            disabled
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: 'var(--ts-border)', background: 'var(--ts-bg-2)', color: 'var(--ts-text-3)' }}
          />
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--ts-text-2)' }}>Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: 'var(--ts-border)', background: 'var(--ts-bg-2)', color: 'var(--ts-text-3)' }}
          />
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--ts-text-2)' }}>Nom complet</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
          />
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--ts-text-2)' }}>
            Nouveau mot de passe (laisser vide pour ne pas changer)
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg px-3 py-2 text-sm border"
            style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}
