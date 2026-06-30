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
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Employee | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', contractHours: '151' })
  const [error, setError] = useState('')

  const loadEmployees = async () => {
    const res = await api.get('/employees')
    setEmployees(res.data)
    setLoading(false)
  }

  useEffect(() => { loadEmployees() }, [])

  const openCreate = () => {
    setForm({ name: '', phone: '', contractHours: '151' })
    setSelected(null)
    setModal('create')
    setError('')
  }

  const openEdit = (emp: Employee) => {
    setForm({ name: emp.name, phone: emp.phone || '', contractHours: String(emp.contractHours) })
    setSelected(emp)
    setModal('edit')
    setError('')
  }

  const saveEmployee = async () => {
    setError('')
    try {
      if (modal === 'create') {
        await api.post('/employees', {
          name: form.name,
          phone: form.phone || undefined,
          contractHours: parseFloat(form.contractHours),
        })
      } else if (modal === 'edit' && selected) {
        await api.put(`/employees/${selected.id}`, {
          name: form.name,
          phone: form.phone || undefined,
          contractHours: parseFloat(form.contractHours),
        })
      }
      setModal(null)
      setForm({ name: '', phone: '', contractHours: '151' })
      await loadEmployees()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur')
    }
  }

  const deleteEmployee = async (id: string) => {
    if (!confirm('Supprimer cet agent ?')) return
    try {
      await api.delete(`/employees/${id}`)
      await loadEmployees()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Impossible de supprimer — cet agent a des shifts ou pointages associés')
    }
  }

  if (loading) return <div className="p-8" style={{ color: 'var(--ts-text-2)' }}>Chargement...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium" style={{ color: 'var(--ts-text)' }}>Agents</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
          style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
        >
          <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 14 }}></i>
          Ajouter un agent
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-xl p-12 text-center border" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
          <p className="text-sm mb-4" style={{ color: 'var(--ts-text-3)' }}>Aucun agent pour le moment</p>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
          >
            Ajouter votre premier agent
          </button>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--ts-text-2)' }}>Nom</th>
                <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--ts-text-2)' }}>Téléphone</th>
                <th className="text-center p-3 text-sm font-medium" style={{ color: 'var(--ts-text-2)' }}>Heures contrat</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="border-t" style={{ borderColor: 'var(--ts-border)' }}>
                  <td className="p-3 text-sm font-medium" style={{ color: 'var(--ts-text)' }}>{emp.name}</td>
                  <td className="p-3 text-sm" style={{ color: 'var(--ts-text-2)' }}>{emp.phone || '—'}</td>
                  <td className="p-3 text-sm text-center" style={{ color: 'var(--ts-text-2)' }}>{emp.contractHours}h</td>
                  <td className="p-3 text-right flex items-center justify-end gap-3">
                    <button onClick={() => openEdit(emp)} className="text-xs" style={{ color: 'var(--ts-accent)' }}>
                      Modifier
                    </button>
                    <button onClick={() => deleteEmployee(emp.id)} className="text-xs" style={{ color: 'var(--ts-red)' }}>
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
          <div className="rounded-xl p-6 w-80 shadow-xl" style={{ background: 'var(--ts-bg-1)' }}>
            <h2 className="text-base font-medium mb-4" style={{ color: 'var(--ts-text)' }}>
              {modal === 'create' ? 'Nouvel agent' : "Modifier l'agent"}
            </h2>
            {error && <p className="text-sm mb-3" style={{ color: 'var(--ts-red)' }}>{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--ts-text-2)' }}>Nom complet</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Karim Mensah"
                  className="w-full rounded-lg px-3 py-2 text-sm border"
                  style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--ts-text-2)' }}>Téléphone (pour SMS)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Ex: 0612345678"
                  className="w-full rounded-lg px-3 py-2 text-sm border"
                  style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--ts-text-2)' }}>Heures contrat/mois</label>
                <input
                  type="number"
                  value={form.contractHours}
                  onChange={e => setForm(f => ({ ...f, contractHours: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm border"
                  style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { setModal(null); setError('') }}
                className="flex-1 px-4 py-2 text-sm rounded-lg border"
                style={{ borderColor: 'var(--ts-border-strong)', color: 'var(--ts-text-2)' }}
              >
                Annuler
              </button>
              <button
                onClick={saveEmployee}
                className="flex-1 px-4 py-2 text-sm rounded-lg font-medium"
                style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
              >
                {modal === 'create' ? 'Ajouter' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
