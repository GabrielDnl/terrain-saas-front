import { useEffect, useState } from 'react'
import api from '../lib/api'

interface RecapEntry {
  employee: {
    id: string
    name: string
    contractHours: number
  }
  workedHours: number
  plannedHours: number
  contractHours: number
  absences: number
  timelogs: number
}

export default function Recap() {
  const now = new Date()
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const [recap, setRecap] = useState<RecapEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const loadRecap = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/timelog/recap/${month}`)
      setRecap(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecap()
  }, [month])

  const changeMonth = (delta: number) => {
    const [year, m] = month.split('-').map(Number)
    const date = new Date(year, m - 1 + delta, 1)
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
  }

  const exportCSV = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/timelog/export/${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `paie-${month}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      alert("Erreur lors de l'export")
    } finally {
      setExporting(false)
    }
  }

  const monthLabel = new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  if (loading) return <div className="p-8" style={{ color: 'var(--ts-text-2)' }}>Chargement...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-medium" style={{ color: 'var(--ts-text)' }}>Récap mensuel</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => changeMonth(-1)}
            className="px-3 py-1.5 text-sm rounded-lg border"
            style={{ borderColor: 'var(--ts-border-strong)', color: 'var(--ts-text-2)' }}
          >
            ← Mois préc.
          </button>
          <span className="text-sm capitalize" style={{ color: 'var(--ts-text-2)' }}>{monthLabel}</span>
          <button
            onClick={() => changeMonth(1)}
            className="px-3 py-1.5 text-sm rounded-lg border"
            style={{ borderColor: 'var(--ts-border-strong)', color: 'var(--ts-text-2)' }}
          >
            Mois suiv. →
          </button>
          <button
            onClick={exportCSV}
            disabled={exporting}
            className="px-3 py-1.5 text-sm rounded-lg font-medium disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
          >
            <i className="ti ti-file-export" aria-hidden="true" style={{ fontSize: 14 }}></i>
            {exporting ? 'Export...' : 'Exporter CSV'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--ts-text-2)' }}>Agent</th>
              <th className="text-center p-3 text-sm font-medium" style={{ color: 'var(--ts-text-2)' }}>Heures contrat</th>
              <th className="text-center p-3 text-sm font-medium" style={{ color: 'var(--ts-text-2)' }}>Heures planifiées</th>
              <th className="text-center p-3 text-sm font-medium" style={{ color: 'var(--ts-text-2)' }}>Heures réalisées</th>
              <th className="text-center p-3 text-sm font-medium" style={{ color: 'var(--ts-text-2)' }}>Absences</th>
              <th className="text-center p-3 text-sm font-medium" style={{ color: 'var(--ts-text-2)' }}>Statut paie</th>
            </tr>
          </thead>
          <tbody>
            {recap.map(entry => {
              const diff = entry.workedHours - entry.contractHours
              const isOk = entry.absences === 0
              return (
                <tr key={entry.employee.id} className="border-t" style={{ borderColor: 'var(--ts-border)' }}>
                  <td className="p-3 text-sm font-medium" style={{ color: 'var(--ts-text)' }}>{entry.employee.name}</td>
                  <td className="p-3 text-sm text-center" style={{ color: 'var(--ts-text-2)' }}>{entry.contractHours}h</td>
                  <td className="p-3 text-sm text-center" style={{ color: 'var(--ts-text-2)' }}>{entry.plannedHours}h</td>
                  <td className="p-3 text-sm text-center">
                    <span style={{ color: entry.workedHours > 0 ? 'var(--ts-green-text)' : 'var(--ts-text-3)', fontWeight: entry.workedHours > 0 ? 500 : 400 }}>
                      {entry.workedHours}h
                    </span>
                    {diff > 0 && (
                      <span className="text-xs ml-1" style={{ color: 'var(--ts-green-text)' }}>+{diff.toFixed(1)}h sup.</span>
                    )}
                    {diff < 0 && entry.workedHours > 0 && (
                      <span className="text-xs ml-1" style={{ color: 'var(--ts-amber-text)' }}>{diff.toFixed(1)}h</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-center">
                    {entry.absences > 0 ? (
                      <span className="font-medium" style={{ color: 'var(--ts-red)' }}>{entry.absences}</span>
                    ) : (
                      <span style={{ color: 'var(--ts-green)' }}>0</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {isOk ? (
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full border"
                        style={{ background: 'var(--ts-green-bg)', color: 'var(--ts-green-text)', borderColor: 'var(--ts-border-strong)' }}
                      >
                        Prêt
                      </span>
                    ) : (
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full border"
                        style={{ background: 'var(--ts-amber-bg)', color: 'var(--ts-amber-text)', borderColor: 'var(--ts-border-strong)' }}
                      >
                        À vérifier
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
