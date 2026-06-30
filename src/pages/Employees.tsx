import { useEffect, useState } from 'react'
import api from '../lib/api'

interface Employee {
  id: string
  name: string
  phone?: string
  contractHours: number
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', contractHours: '151' })
  const [error, setError] = useState('')

  const loadEmployees = async () => {
    const res = await api.get('/employees')
    setEmployees(res.data)
    setLoading(false)
  }

  useEffect(() => { loadEmployees() }, [])

  const createEmployee = async () => {
    setError('')
    try {
      await api.post('/employees', {
        name: form.name,
        phone: form.phone || undefined,
        contractHours: parseFloat(form.contractHours),
      })
      setModal(false)
      setForm({ name: '', phone: '', contractHours: '151' })
      await loadEmployees()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur')
    }
  }

  const deleteEmployee = async (id: string) => {
    if (!confirm('Supprimer cet agent ?')) return
    try {
        await api.delete(`/employees/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        })
        await loadEmployees()
    } catch (err: any) {
        alert(err.response?.data?.error || 'Erreur')
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Agents</h1>
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          + Ajouter un agent
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm mb-4">Aucun agent pour le moment</p>
          <button
            onClick={() => setModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Ajouter votre premier agent
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Nom</th>
                <th className="text-left p-3 text-sm font-medium text-gray-500">Téléphone</th>
                <th className="text-center p-3 text-sm font-medium text-gray-500">Heures contrat</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="border-t border-gray-100">
                  <td className="p-3 text-sm font-medium text-gray-900">{emp.name}</td>
                  <td className="p-3 text-sm text-gray-500">{emp.phone || '—'}</td>
                  <td className="p-3 text-sm text-center text-gray-500">{emp.contractHours}h</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => deleteEmployee(emp.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
            <h2 className="text-base font-medium mb-4">Nouvel agent</h2>
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nom complet</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Karim Mensah"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Téléphone (pour SMS)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Ex: 0612345678"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Heures contrat/mois</label>
                <input
                  type="number"
                  value={form.contractHours}
                  onChange={e => setForm(f => ({ ...f, contractHours: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { setModal(false); setError('') }}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={createEmployee}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}