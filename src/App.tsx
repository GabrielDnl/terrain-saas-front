import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import WeekPlanning from './components/WeekPlanning'
import AgentPlanning from './pages/AgentPlanning'
import LiveView from './pages/LiveView'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  return token ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/planning" element={
          <PrivateRoute>
            <WeekPlanning />
          </PrivateRoute>
        } />
        <Route path="/live" element={
          <PrivateRoute>
            <LiveView />
          </PrivateRoute>
        } />
        <Route path="/mon-planning/:token" element={<AgentPlanning />} />
        <Route path="*" element={<Navigate to="/planning" />} />
      </Routes>
    </BrowserRouter>
  )
}