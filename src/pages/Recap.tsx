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

  const monthLabel = new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-medium text-gray-900">Récap mensuel</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            ← Mois préc.
          </button>
          <span className="text-sm text-gray-500 capitalize">{monthLabel}</span>
          <button
            onClick={() => changeMonth(1)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Mois suiv. →
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Agent</th>
              <th className="text-center p-3 text-sm font-medium text-gray-500">Heures contrat</th>
              <th className="text-center p-3 text-sm font-medium text-gray-500">Heures planifiées</th>
              <th className="text-center p-3 text-sm font-medium text-gray-500">Heures réalisées</th>
              <th className="text-center p-3 text-sm font-medium text-gray-500">Absences</th>
              <th className="text-center p-3 text-sm font-medium text-gray-500">Statut paie</th>
            </tr>
          </thead>
          <tbody>
            {recap.map(entry => {
              const diff = entry.workedHours - entry.contractHours
              const isOk = entry.absences === 0
              return (
                <tr key={entry.employee.id} className="border-t border-gray-100">
                  <td className="p-3 text-sm font-medium text-gray-900">{entry.employee.name}</td>
                  <td className="p-3 text-sm text-center text-gray-600">{entry.contractHours}h</td>
                  <td className="p-3 text-sm text-center text-gray-600">{entry.plannedHours}h</td>
                  <td className="p-3 text-sm text-center">
                    <span className={entry.workedHours > 0 ? 'text-green-700 font-medium' : 'text-gray-400'}>
                      {entry.workedHours}h
                    </span>
                    {diff > 0 && (
                      <span className="text-xs text-green-600 ml-1">+{diff.toFixed(1)}h sup.</span>
                    )}
                    {diff < 0 && entry.workedHours > 0 && (
                      <span className="text-xs text-amber-600 ml-1">{diff.toFixed(1)}h</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-center">
                    {entry.absences > 0 ? (
                      <span className="text-red-600 font-medium">{entry.absences}</span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {isOk ? (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                        Prêt
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
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