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

  if (loading) return <div className="p-8" style={{ color: 'var(--ts-text-2)' }}>Chargement...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium" style={{ color: 'var(--ts-text)' }}>Vue en temps réel</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--ts-text-3)' }}>
            Mis à jour à {lastUpdate.getHours()}h{String(lastUpdate.getMinutes()).padStart(2, '0')}
            — rafraîchissement auto toutes les 30s
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
          style={{ borderColor: 'var(--ts-border-strong)', color: 'var(--ts-text-2)' }}
        >
          Rafraîchir
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl p-4" style={{ background: 'var(--ts-bg-2)' }}>
          <div className="text-2xl font-medium" style={{ color: 'var(--ts-text)' }}>{uniqueEmployees.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ts-text-2)' }}>Agents total</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--ts-green-bg)' }}>
          <div className="text-2xl font-medium" style={{ color: 'var(--ts-green-text)' }}>{live.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ts-green-text)' }}>En poste</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--ts-red-bg)' }}>
          <div className="text-2xl font-medium" style={{ color: 'var(--ts-red-text)' }}>
            {uniqueEmployees.length - live.length - absences.length}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--ts-red-text)' }}>Non pointés</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--ts-amber-bg)' }}>
          <div className="text-2xl font-medium" style={{ color: 'var(--ts-amber-text)' }}>{absences.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ts-amber-text)' }}>Absences signalées</div>
        </div>
      </div>

      {absences.length > 0 && (
        <div
          className="rounded-xl p-4 mb-6 border"
          style={{ background: 'var(--ts-amber-bg)', borderColor: 'var(--ts-border-strong)' }}
        >
          <div className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: 'var(--ts-amber-text)' }}>
            <i className="ti ti-alert-triangle" aria-hidden="true" style={{ fontSize: 16 }}></i>
            Absences signalées aujourd'hui
          </div>
          <div className="space-y-2">
            {absences.map(absence => (
              <div key={absence.id} className="flex items-center justify-between text-sm">
                <span className="font-medium" style={{ color: 'var(--ts-amber-text)' }}>{absence.employee.name}</span>
                <span className="text-xs" style={{ color: 'var(--ts-amber-text)' }}>
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
          const dotColor = timelog ? 'var(--ts-green)' : absence ? 'var(--ts-amber)' : 'var(--ts-text-3)'
          return (
            <div
              key={emp.id}
              className="rounded-xl p-4 flex items-center justify-between border"
              style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dotColor }}></div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--ts-text)' }}>{emp.name}</div>
                  {timelog ? (
                    <div className="text-xs mt-0.5" style={{ color: 'var(--ts-green-text)' }}>
                      Arrivé à {new Date(timelog.clockIn).getHours()}h{String(new Date(timelog.clockIn).getMinutes()).padStart(2, '0')}
                    </div>
                  ) : absence ? (
                    <div className="text-xs mt-0.5" style={{ color: 'var(--ts-amber-text)' }}>Absence signalée</div>
                  ) : (
                    <div className="text-xs mt-0.5" style={{ color: 'var(--ts-text-3)' }}>Non pointé</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                {timelog ? (
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--ts-green-text)' }}>{getElapsed(timelog.clockIn)}</div>
                    <div className="text-xs" style={{ color: 'var(--ts-text-3)' }}>en poste</div>
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--ts-text-3)' }}>—</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
