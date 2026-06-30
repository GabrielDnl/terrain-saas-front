import { useEffect, useState } from 'react'
import api from '../lib/api'

interface LiveTimelog {
  id: string
  clockIn: string
  employee: { id: string; name: string; phone?: string }
}

interface Absence {
  id: string
  createdAt: string
  employee: { id: string; name: string }
}

interface Employee {
  id: string
  name: string
}

interface Shift {
  id: string
  startTime: string
  endTime: string
  site?: string
  employeeId: string
  employee?: { name: string }
}

export default function Dashboard() {
  const [live, setLive] = useState<LiveTimelog[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [todayShifts, setTodayShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)

      const [liveRes, empRes, shiftRes] = await Promise.all([
        api.get('/timelog/live'),
        api.get('/employees'),
        api.get(`/shifts?startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
      ])
      setLive(liveRes.data.live)
      setAbsences(liveRes.data.absences)
      setEmployees(empRes.data)
      setTodayShifts(shiftRes.data)
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

  const uniqueEmployees = employees.filter(
    (emp, index, self) => index === self.findLastIndex(e => e.name === emp.name)
  )

  const inPost = (empId: string) => live.find(t => t.employee.id === empId)
  const hasAbsence = (empId: string) => absences.find(a => a.employee.id === empId)

  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const activity = [
    ...absences.map(a => ({
      id: `abs-${a.id}`,
      name: a.employee.name,
      text: 'a signalé une absence',
      time: a.createdAt,
      color: 'var(--ts-red)',
    })),
    ...live.map(t => ({
      id: `live-${t.id}`,
      name: t.employee.name,
      text: 'a pointé son arrivée',
      time: t.clockIn,
      color: 'var(--ts-green)',
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6)

  const notClockedCount = uniqueEmployees.length - live.length - absences.length

  if (loading) return <div className="p-8" style={{ color: 'var(--ts-text-2)' }}>Chargement...</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="text-xs font-semibold tracking-wide uppercase mb-1" style={{ color: 'var(--ts-accent)' }}>
          Tableau de bord
        </div>
        <h1 className="text-2xl font-semibold capitalize" style={{ color: 'var(--ts-text)' }}>{todayLabel}</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl p-4 border" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
          <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--ts-text-3)' }}>Agents actifs</div>
          <div className="text-3xl font-semibold" style={{ color: 'var(--ts-text)' }}>{live.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ts-green)' }}>sur {uniqueEmployees.length} planifiés</div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
          <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--ts-text-3)' }}>Non pointés</div>
          <div className="text-3xl font-semibold" style={{ color: 'var(--ts-text)' }}>{Math.max(notClockedCount, 0)}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ts-amber)' }}>en attente</div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
          <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--ts-text-3)' }}>Absences</div>
          <div className="text-3xl font-semibold" style={{ color: 'var(--ts-text)' }}>{absences.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ts-red)' }}>signalée{absences.length > 1 ? 's' : ''}</div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
          <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--ts-text-3)' }}>Shifts aujourd'hui</div>
          <div className="text-3xl font-semibold" style={{ color: 'var(--ts-text)' }}>{todayShifts.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--ts-text-3)' }}>planifiés</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        {/* AGENTS STATUT */}
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--ts-border)' }}>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ts-text-3)' }}>
              Agents — statut temps réel
            </span>
            <a href="/agents" className="text-xs" style={{ color: 'var(--ts-accent)' }}>voir tous</a>
          </div>
          {uniqueEmployees.length === 0 ? (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--ts-text-3)' }}>Aucun agent</div>
          ) : (
            uniqueEmployees.slice(0, 6).map(emp => {
              const timelog = inPost(emp.id)
              const absence = hasAbsence(emp.id)
              const statusLabel = timelog ? 'En poste' : absence ? 'Absent' : 'Pas pointé'
              const statusBg = timelog ? 'var(--ts-green-bg)' : absence ? 'var(--ts-red-bg)' : 'var(--ts-amber-bg)'
              const statusColor = timelog ? 'var(--ts-green-text)' : absence ? 'var(--ts-red-text)' : 'var(--ts-amber-text)'
              return (
                <div
                  key={emp.id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0"
                  style={{ borderColor: 'var(--ts-border)' }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--ts-accent-bg)', color: 'var(--ts-accent-text)' }}
                  >
                    {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--ts-text)' }}>{emp.name}</div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide flex-shrink-0"
                    style={{ background: statusBg, color: statusColor }}
                  >
                    {statusLabel}
                  </span>
                  <span className="text-xs w-12 text-right flex-shrink-0" style={{ color: 'var(--ts-text-3)' }}>
                    {timelog ? `${new Date(timelog.clockIn).getHours()}:${String(new Date(timelog.clockIn).getMinutes()).padStart(2, '0')}` : '—'}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* ACTIVITÉ RÉCENTE */}
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--ts-border)' }}>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ts-text-3)' }}>
              Activité récente
            </span>
            <a href="/recap" className="text-xs" style={{ color: 'var(--ts-accent)' }}>tout voir</a>
          </div>
          {activity.length === 0 ? (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--ts-text-3)' }}>Aucune activité aujourd'hui</div>
          ) : (
            activity.map(ev => (
              <div
                key={ev.id}
                className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 text-sm"
                style={{ borderColor: 'var(--ts-border)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ev.color }}></span>
                <span className="flex-1 min-w-0 truncate" style={{ color: 'var(--ts-text-2)' }}>
                  <span className="font-medium" style={{ color: 'var(--ts-text)' }}>{ev.name}</span> {ev.text}
                </span>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--ts-text-3)' }}>
                  {new Date(ev.time).getHours()}:{String(new Date(ev.time).getMinutes()).padStart(2, '0')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PLANNING DU JOUR */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--ts-border)' }}>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ts-text-3)' }}>
            Planning du jour
          </span>
          <a href="/planning" className="text-xs" style={{ color: 'var(--ts-accent)' }}>modifier</a>
        </div>
        {todayShifts.length === 0 ? (
          <div className="p-6 text-center text-sm" style={{ color: 'var(--ts-text-3)' }}>Aucun shift aujourd'hui</div>
        ) : (
          todayShifts.map(shift => {
            const absence = absences.find(a => a.employee.id === shift.employeeId)
            const done = live.find(t => t.employee.id === shift.employeeId)
            const label = absence ? 'Absence signalée' : `${new Date(shift.startTime).getHours()}:00 → ${new Date(shift.endTime).getHours()}:00`
            const color = absence ? 'var(--ts-red)' : done ? 'var(--ts-green)' : 'var(--ts-accent)'
            const bg = absence ? 'var(--ts-red-bg)' : done ? 'var(--ts-green-bg)' : 'var(--ts-accent-bg)'
            return (
              <div
                key={shift.id}
                className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0"
                style={{ borderColor: 'var(--ts-border)' }}
              >
                <span className="text-sm w-32 flex-shrink-0" style={{ color: 'var(--ts-text-2)' }}>
                  {shift.employee?.name || '—'}
                </span>
                <span
                  className="text-xs px-2 py-1 rounded font-medium"
                  style={{ background: bg, color }}
                >
                  {label}
                </span>
                {shift.site && <span className="text-xs" style={{ color: 'var(--ts-text-3)' }}>{shift.site}</span>}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}