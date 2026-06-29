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

interface Employee {
  id: string
  name: string
}

export default function LiveView() {
  const [live, setLive] = useState<LiveTimelog[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const loadData = async () => {
    try {
      const [liveRes, empRes] = await Promise.all([
        api.get('/timelog/live'),
        api.get('/employees'),
      ])
      setLive(liveRes.data)
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

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-2xl font-medium text-gray-900">{uniqueEmployees.length}</div>
          <div className="text-xs text-gray-500 mt-1">Agents total</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-2xl font-medium text-green-700">{live.length}</div>
          <div className="text-xs text-green-600 mt-1">En poste</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <div className="text-2xl font-medium text-red-700">{uniqueEmployees.length - live.length}</div>
          <div className="text-xs text-red-600 mt-1">Absents</div>
        </div>
      </div>

      <div className="space-y-3">
        {uniqueEmployees.map(emp => {
          const timelog = inPost(emp.id)
          return (
            <div key={emp.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${timelog ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                  {timelog ? (
                    <div className="text-xs text-green-600 mt-0.5">
                      Arrivé à {new Date(timelog.clockIn).getHours()}h{String(new Date(timelog.clockIn).getMinutes()).padStart(2, '0')}
                    </div>
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