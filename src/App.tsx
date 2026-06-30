import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import WeekPlanning from './components/WeekPlanning'
import AgentPlanning from './pages/AgentPlanning'
import LiveView from './pages/LiveView'
import Recap from './pages/Recap'
import Upgrade from './pages/Upgrade'
import Employees from './pages/Employees'
import Profile from './pages/Profile'
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  return token ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mon-planning/:token" element={<AgentPlanning />} />
        <Route path="/planning" element={
          <PrivateRoute><Layout><WeekPlanning /></Layout></PrivateRoute>
        } />
        <Route path="/agents" element={
          <PrivateRoute><Layout><Employees /></Layout></PrivateRoute>
        } />
        <Route path="/live" element={
          <PrivateRoute><Layout><LiveView /></Layout></PrivateRoute>
        } />
        <Route path="/recap" element={
          <PrivateRoute><Layout><Recap /></Layout></PrivateRoute>
        } />
        <Route path="/upgrade" element={
          <PrivateRoute><Layout><Upgrade /></Layout></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><Layout><Profile /></Layout></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}