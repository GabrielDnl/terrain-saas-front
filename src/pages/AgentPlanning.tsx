import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'

interface Shift {
  id: string
  startTime: string
  endTime: string
  site?: string
}

export default function AgentPlanning() {
  const { token } = useParams()
  const [data, setData] = useState<{ employee: { name: string }; shifts: Shift[] } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/agent/${token}`)
        setData(res.data)
      } catch {
        setError('Lien invalide ou expiré')
      }
    }
    load()
  }, [token])

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-lg font-medium text-gray-900 mb-1">Bonjour {data.employee.name.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 mb-6">Votre planning de la semaine</p>

        {data.shifts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">Aucun shift cette semaine</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.shifts.map(shift => {
              const start = new Date(shift.startTime)
              const end = new Date(shift.endTime)
              const day = start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
              return (
                <div key={shift.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-sm font-medium text-gray-900 capitalize">{day}</div>
                  <div className="text-blue-600 font-medium mt-1">
                    {start.getUTCHours()}h00 – {end.getUTCHours()}h00
                  </div>
                  {shift.site && (
                    <div className="text-xs text-gray-500 mt-1">{shift.site}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}