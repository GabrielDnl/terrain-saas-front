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

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div className="p-6">
      {paymentSuccess && (
        <div className="mb-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center justify-between">
          <span>✓ Abonnement activé — bienvenue sur Terrain SaaS !</span>
          <button onClick={() => setPaymentSuccess(false)} className="text-green-500 hover:text-green-700">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-medium text-gray-900">Planning</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setWeekOffset(w => w - 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">← Semaine préc.</button>
          <span className="text-sm text-gray-500">{weekParam}</span>
          <button onClick={() => setWeekOffset(w => w + 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Semaine suiv. →</button>
          <button onClick={copyPreviousWeek} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Copier sem. préc.</button>
          <button onClick={publishPlanning} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Publier le planning</button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm mb-4">Aucun agent — commencez par en ajouter</p>
          <a href="/agents" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Ajouter des agents</a>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-500 w-36">Agent</th>
                {dates.map((d, i) => (
                  <th key={i} className="p-3 text-sm font-medium text-gray-500 text-center min-w-28">
                    <div>{DAYS[i]}</div>
                    <div className="text-xs font-normal text-gray-400">{d.getDate()}/{d.getMonth() + 1}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="border-t border-gray-100">
                  <td className="p-3 text-sm font-medium text-gray-700">{emp.name}</td>
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
                                className={`border rounded-lg p-2 text-xs group relative cursor-pointer ${
                                  conflict ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'
                                }`}
                                onClick={() => openModal(emp.id, date, shift)}
                              >
                                <div className={`font-medium ${conflict ? 'text-red-800' : 'text-blue-800'}`}>
                                  {new Date(shift.startTime).getHours()}h–{new Date(shift.endTime).getHours()}h
                                </div>
                                {shift.site && (
                                  <div className={conflict ? 'text-red-600 mt-0.5' : 'text-blue-600 mt-0.5'}>{shift.site}</div>
                                )}
                                {conflict && <div className="text-red-500 text-xs mt-0.5 font-medium">Conflit</div>}
                                <button
                                  onClick={e => { e.stopPropagation(); deleteShift(shift.id) }}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => openModal(emp.id, date)}
                            className="w-full h-12 rounded-lg border border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-gray-300 hover:text-blue-400 text-lg"
                          >
                            +
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
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
            <h2 className="text-base font-medium mb-4">{modal.shiftId ? 'Modifier le shift' : 'Nouveau shift'}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Heure de début</label>
                <select value={form.startHour} onChange={e => setForm(f => ({ ...f, startHour: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Heure de fin</label>
                <select value={form.endHour} onChange={e => setForm(f => ({ ...f, endHour: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Site (optionnel)</label>
                <input type="text" value={form.site} onChange={e => setForm(f => ({ ...f, site: e.target.value }))} placeholder="Ex: Site Lyon 1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
              <button onClick={saveShift} className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">{modal.shiftId ? 'Enregistrer' : 'Créer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}