import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Stocks from './pages/Stocks'
import Quotes from './pages/Quotes'
import News from './pages/News'
import ClientDetail from './pages/Clients/[id]'
import Settings from './pages/Settings'
import AI from './pages/AI'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="stocks" element={<Stocks />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="news" element={<News />} />
          <Route path="settings" element={<Settings />} />
          <Route path="ai" element={<AI />} />
          <Route path="/clients/:id" element={<PrivateRoute><ClientDetail /></PrivateRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}