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
      <h1 className="text-xl font-medium text-gray-900 mb-6">Mon profil</h1>

      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        {success && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Entreprise</label>
          <input
            type="text"
            value={companyName}
            disabled
            className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Nom complet</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}