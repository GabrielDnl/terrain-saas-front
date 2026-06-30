import { useEffect, useState } from 'react'
import api from '../lib/api'
import type { Shift, Employee } from '../types'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function getWeekDates(offset: number) {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function getWeekParam(dates: Date[]) {
  const d = dates[0]
  const startOfYear = new Date(d.getFullYear(), 0, 4)
  const diff = d.getTime() - startOfYear.getTime()
  const week = Math.ceil((diff / 86400000 + ((startOfYear.getDay() + 6) % 7)) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export default function WeekPlanning() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ employeeId: string; date: Date; shiftId?: string } | null>(null)
  const [form, setForm] = useState({ startHour: '07', endHour: '15', site: '' })
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const dates = getWeekDates(weekOffset)
  const weekParam = getWeekParam(dates)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      setPaymentSuccess(true)
      window.history.replaceState({}, '', '/planning')
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    const start = dates[0]
    const end = new Date(dates[6])
    end.setDate(end.getDate() + 1)
    const [empRes, shiftRes] = await Promise.all([
      api.get('/employees'),
      api.get(`/shifts?startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
    ])
    setEmployees(empRes.data)
    setShifts(shiftRes.data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [weekOffset])

  const getShiftsForCell = (employeeId: string, date: Date) =>
    shifts.filter(s => {
      const sd = new Date(s.startTime)
      return s.employeeId === employeeId &&
        sd.getDate() === date.getDate() &&
        sd.getMonth() === date.getMonth() &&
        sd.getFullYear() === date.getFullYear()
    })

  const hasConflict = (employeeId: string, date: Date) =>
    getShiftsForCell(employeeId, date).length > 1

  const openModal = (employeeId: string, date: Date, shift?: Shift) => {
    if (shift) {
      setForm({
        startHour: String(new Date(shift.startTime).getHours()).padStart(2, '0'),
        endHour: String(new Date(shift.endTime).getHours()).padStart(2, '0'),
        site: shift.site || '',
      })
      setModal({ employeeId, date, shiftId: shift.id })
    } else {
      setForm({ startHour: '07', endHour: '15', site: '' })
      setModal({ employeeId, date })
    }
  }

  const saveShift = async () => {
    if (!modal) return
    const start = new Date(modal.date)
    start.setHours(parseInt(form.startHour), 0, 0, 0)
    const end = new Date(modal.date)
    end.setHours(parseInt(form.endHour), 0, 0, 0)
    try {
      if (modal.shiftId) {
        await api.put(`/shifts/${modal.shiftId}`, {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          site: form.site || undefined,
        })
      } else {
        await api.post('/shifts', {
          employeeId: modal.employeeId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          site: form.site || undefined,
        })
      }
      setModal(null)
      await loadData()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur')
    }
  }

  const deleteShift = async (id: string) => {
    await api.delete(`/shifts/${id}`)
    setShifts(shifts.filter(s => s.id !== id))
  }

  const publishPlanning = async () => {
    const start = dates[0]
    const end = new Date(dates[6])
    end.setDate(end.getDate() + 1)
    try {
      const res = await api.post('/shifts/publish', {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      })
      alert(`Planning publié — ${res.data.results.length} SMS envoyés`)
    } catch {
      alert('Erreur lors de la publication')
    }
  }

  const copyPreviousWeek = async () => {
    const prevDates = getWeekDates(weekOffset - 1)
    const sourceStart = prevDates[0]
    const sourceEnd = new Date(prevDates[6])
    sourceEnd.setDate(prevDates[6].getDate() + 1)
    const targetStart = dates[0]
    try {
      const res = await api.post('/shifts/copy-week', {
        sourceStart: sourceStart.toISOString(),
        sourceEnd: sourceEnd.toISOString(),
        targetStart: targetStart.toISOString(),
      })
      alert(`${res.data.copied} shifts copiés depuis la semaine précédente`)
      await loadData()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la copie')
    }
  }

  if (loading) return <div className="p-8" style={{ color: 'var(--ts-text-2)' }}>Chargement...</div>

  return (
    <div className="p-6">
      {paymentSuccess && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm flex items-center justify-between border"
          style={{ background: 'var(--ts-green-bg)', borderColor: 'var(--ts-border-strong)', color: 'var(--ts-green-text)' }}
        >
          <span className="flex items-center gap-1.5">
            <i className="ti ti-circle-check" aria-hidden="true" style={{ fontSize: 16 }}></i>
            Abonnement activé — bienvenue sur Terrain SaaS !
          </span>
          <button onClick={() => setPaymentSuccess(false)} aria-label="Fermer" style={{ color: 'var(--ts-green-text)' }}>
            <i className="ti ti-x" aria-hidden="true" style={{ fontSize: 14 }}></i>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-medium" style={{ color: 'var(--ts-text)' }}>Planning</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
            style={{ borderColor: 'var(--ts-border-strong)', color: 'var(--ts-text-2)' }}
          >
            ← Semaine préc.
          </button>
          <span className="text-sm" style={{ color: 'var(--ts-text-2)' }}>{weekParam}</span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
            style={{ borderColor: 'var(--ts-border-strong)', color: 'var(--ts-text-2)' }}
          >
            Semaine suiv. →
          </button>
          <button
            onClick={copyPreviousWeek}
            className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
            style={{ borderColor: 'var(--ts-border-strong)', color: 'var(--ts-text-2)' }}
          >
            Copier sem. préc.
          </button>
          <button
            onClick={publishPlanning}
            className="px-3 py-1.5 text-sm rounded-lg font-medium"
            style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
          >
            Publier le planning
          </button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center border"
          style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}
        >
          <p className="text-sm mb-4" style={{ color: 'var(--ts-text-3)' }}>Aucun agent — commencez par en ajouter</p>
          <a
            href="/agents"
            className="px-4 py-2 rounded-lg text-sm font-medium inline-block"
            style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
          >
            Ajouter des agents
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 text-sm font-medium w-36" style={{ color: 'var(--ts-text-2)' }}>Agent</th>
                {dates.map((d, i) => (
                  <th key={i} className="p-3 text-sm font-medium text-center min-w-28" style={{ color: 'var(--ts-text-2)' }}>
                    <div>{DAYS[i]}</div>
                    <div className="text-xs font-normal" style={{ color: 'var(--ts-text-3)' }}>{d.getDate()}/{d.getMonth() + 1}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="border-t" style={{ borderColor: 'var(--ts-border)' }}>
                  <td className="p-3 text-sm font-medium" style={{ color: 'var(--ts-text)' }}>{emp.name}</td>
                  {dates.map((date, i) => {
                    const cellShifts = getShiftsForCell(emp.id, date)
                    const conflict = hasConflict(emp.id, date)
                    return (
                      <td key={i} className="p-1.5 text-center">
                        {cellShifts.length > 0 ? (
                          <div className="space-y-1">
                            {cellShifts.map(shift => (
                              <div
                                key={shift.id}
                                className="border rounded-lg p-2 text-xs group relative cursor-pointer"
                                style={
                                  conflict
                                    ? { background: 'var(--ts-red-bg)', borderColor: 'var(--ts-border-strong)' }
                                    : { background: 'var(--ts-accent-bg)', borderColor: 'var(--ts-border)' }
                                }
                                onClick={() => openModal(emp.id, date, shift)}
                              >
                                <div className="font-medium" style={{ color: conflict ? 'var(--ts-red-text)' : 'var(--ts-accent-text)' }}>
                                  {new Date(shift.startTime).getHours()}h–{new Date(shift.endTime).getHours()}h
                                </div>
                                {shift.site && (
                                  <div className="mt-0.5" style={{ color: conflict ? 'var(--ts-red-text)' : 'var(--ts-accent-text)' }}>{shift.site}</div>
                                )}
                                {conflict && (
                                  <div className="text-xs mt-0.5 font-medium" style={{ color: 'var(--ts-red-text)' }}>Conflit</div>
                                )}
                                <button
                                  onClick={e => { e.stopPropagation(); deleteShift(shift.id) }}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-xs"
                                  style={{ color: 'var(--ts-red)' }}
                                  aria-label="Supprimer le shift"
                                >
                                  <i className="ti ti-x" aria-hidden="true"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => openModal(emp.id, date)}
                            className="w-full h-12 rounded-lg border border-dashed transition-colors text-lg flex items-center justify-center"
                            style={{ borderColor: 'var(--ts-border-strong)', color: 'var(--ts-text-3)' }}
                          >
                            <i className="ti ti-plus" aria-hidden="true"></i>
                          </button>
                        )}
                      </td>
                    )
                  })}
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
              {modal.shiftId ? 'Modifier le shift' : 'Nouveau shift'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--ts-text-2)' }}>Heure de début</label>
                <select
                  value={form.startHour}
                  onChange={e => setForm(f => ({ ...f, startHour: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm border"
                  style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
                >
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--ts-text-2)' }}>Heure de fin</label>
                <select
                  value={form.endHour}
                  onChange={e => setForm(f => ({ ...f, endHour: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-sm border"
                  style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
                >
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--ts-text-2)' }}>Site (optionnel)</label>
                <input
                  type="text"
                  value={form.site}
                  onChange={e => setForm(f => ({ ...f, site: e.target.value }))}
                  placeholder="Ex: Site Lyon 1"
                  className="w-full rounded-lg px-3 py-2 text-sm border"
                  style={{ borderColor: 'var(--ts-border-strong)', background: 'var(--ts-bg-1)', color: 'var(--ts-text)' }}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2 text-sm rounded-lg border"
                style={{ borderColor: 'var(--ts-border-strong)', color: 'var(--ts-text-2)' }}
              >
                Annuler
              </button>
              <button
                onClick={saveShift}
                className="flex-1 px-4 py-2 text-sm rounded-lg font-medium"
                style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
              >
                {modal.shiftId ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
