import { Outlet } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'
import Sidebar from './Sidebar'

export default function Layout() {
  const { theme } = useSettings()
  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}