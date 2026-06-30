import { useEffect, useState } from 'react'
import api from '../lib/api'

interface LiveTimelog {
  id: string
  clockIn: string
  lat?: number
  lng?: number
  employee: {
    id: string
    name: string
    phone?: string
  }
}

interface Absence {
  id: string
  createdAt: string
  employee: {
    id: string
    name: string
  }
}

interface Employee {
  id: string
  name: string
}

export default function LiveView() {
  const [live, setLive] = useState<LiveTimelog[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const loadData = async () => {
    try {
      const [liveRes, empRes] = await Promise.all([
        api.get('/timelog/live'),
        api.get('/employees'),
      ])
      setLive(liveRes.data.live)
      setAbsences(liveRes.data.absences)
      setEmployees(empRes.data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getElapsed = (clockIn: string) => {
    const diff = new Date().getTime() - new Date(clockIn).getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    if (hours > 0) return `${hours}h${String(minutes).padStart(2, '0')}`
    return `${minutes} min`
  }

  const uniqueEmployees = employees.filter(
    (emp, index, self) => index === self.findLastIndex(e => e.name === emp.name)
  )

  const inPost = (empId: string) => live.find(t => t.employee.id === empId)

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Vue en temps réel</h1>
          <p className="text-xs text-gray-400 mt-1">
            Mis à jour à {lastUpdate.getHours()}h{String(lastUpdate.getMinutes()).padStart(2, '0')}
            — rafraîchissement auto toutes les 30s
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Rafraîchir
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-2xl font-medium text-gray-900">{uniqueEmployees.length}</div>
          <div className="text-xs text-gray-500 mt-1">Agents total</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-2xl font-medium text-green-700">{live.length}</div>
          <div className="text-xs text-green-600 mt-1">En poste</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <div className="text-2xl font-medium text-red-700">{uniqueEmployees.length - live.length - absences.length}</div>
          <div className="text-xs text-red-600 mt-1">Non pointés</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <div className="text-2xl font-medium text-amber-700">{absences.length}</div>
          <div className="text-xs text-amber-600 mt-1">Absences signalées</div>
        </div>
      </div>

      {absences.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
          <div className="text-sm font-medium text-amber-800 mb-2">⚠ Absences signalées aujourd'hui</div>
          <div className="space-y-2">
            {absences.map(absence => (
              <div key={absence.id} className="flex items-center justify-between text-sm">
                <span className="text-amber-700 font-medium">{absence.employee.name}</span>
                <span className="text-amber-600 text-xs">
                  à {new Date(absence.createdAt).getHours()}h{String(new Date(absence.createdAt).getMinutes()).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {uniqueEmployees.map(emp => {
          const timelog = inPost(emp.id)
          const absence = absences.find(a => a.employee.id === emp.id)
          return (
            <div key={emp.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  timelog ? 'bg-green-500' : absence ? 'bg-amber-400' : 'bg-gray-300'
                }`}></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                  {timelog ? (
                    <div className="text-xs text-green-600 mt-0.5">
                      Arrivé à {new Date(timelog.clockIn).getHours()}h{String(new Date(timelog.clockIn).getMinutes()).padStart(2, '0')}
                    </div>
                  ) : absence ? (
                    <div className="text-xs text-amber-600 mt-0.5">Absence signalée</div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-0.5">Non pointé</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                {timelog ? (
                  <div>
                    <div className="text-sm font-medium text-green-700">{getElapsed(timelog.clockIn)}</div>
                    <div className="text-xs text-gray-400">en poste</div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}