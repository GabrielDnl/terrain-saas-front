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
  const [data, setData] = useState<{
    employee: { name: string; id: string }
    shifts: Shift[]
    isClockedIn: boolean
    clockIn: string | null
  } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {
    try {
      const res = await api.get(`/agent/${token}`)
      setData(res.data)
    } catch {
      setError('Lien invalide ou expiré')
    }
  }

  useEffect(() => {
    loadData()
  }, [token])

  const getLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise(resolve => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      )
    })
  }

  const clockIn = async () => {
    setLoading(true)
    setGeoError('')
    setSuccess('')
    try {
      const loc = await getLocation()
      if (!loc) setGeoError('Géolocalisation non disponible — pointage sans position')

      await api.post(`/agent/${token}/clockin`, {
        ...(loc && { lat: loc.lat, lng: loc.lng }),
      })
      setSuccess('Arrivée enregistrée')
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du pointage')
    } finally {
      setLoading(false)
    }
  }

  const clockOut = async () => {
    setLoading(true)
    setSuccess('')
    try {
      const loc = await getLocation()
      await api.post(`/agent/${token}/clockout`, {
        ...(loc && { lat: loc.lat, lng: loc.lng }),
      })
      setSuccess('Départ enregistré')
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du pointage')
    } finally {
      setLoading(false)
    }
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <p className="text-red-500 text-sm text-center">{error}</p>
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
        <h1 className="text-lg font-medium text-gray-900 mb-1">
          Bonjour {data.employee.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500 mb-6">Votre planning de la semaine</p>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="text-sm font-medium text-gray-700 mb-3">Pointage</div>

          {data.isClockedIn ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-green-700 font-medium">En poste</span>
                {data.clockIn && (
                  <span className="text-xs text-gray-500 ml-auto">
                    depuis {new Date(data.clockIn).getHours()}h{String(new Date(data.clockIn).getMinutes()).padStart(2, '0')}
                  </span>
                )}
              </div>
              <button
                onClick={clockOut}
                disabled={loading}
                className="w-full py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Pointer mon départ'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-500">Non pointé</span>
              </div>
              <button
                onClick={clockIn}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Pointer mon arrivée'}
              </button>
            </div>
          )}

          {geoError && <p className="text-xs text-amber-600 mt-2">{geoError}</p>}
          {success && <p className="text-xs text-green-600 mt-2 font-medium">{success}</p>}
        </div>

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
                    {start.getHours()}h00 – {end.getHours()}h00
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