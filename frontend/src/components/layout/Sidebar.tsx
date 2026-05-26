import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'
import { LayoutDashboard, Users, TrendingUp, DollarSign, Newspaper, LogOut, Settings, X } from 'lucide-react'

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { logout, user } = useAuth()
  const { t } = useSettings()
  const navigate = useNavigate()

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/clients',   icon: Users,           label: t('nav.clients') },
    { to: '/stocks',    icon: TrendingUp,       label: t('nav.stocks') },
    { to: '/quotes',    icon: DollarSign,       label: t('nav.quotes') },
    { to: '/news',      icon: Newspaper,        label: t('nav.news') },
    { to: '/settings',  icon: Settings,         label: t('nav.settings') },
  ]

  return (
    <aside className="w-60 min-h-screen h-full bg-[#0a0f1e] flex flex-col">
      <div className="px-6 py-8 flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            Fin<span className="text-emerald-400">Dash</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">Financial Dashboard</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-6 border-t border-white/5">
        <p className="text-slate-300 text-sm font-medium truncate">{user?.name}</p>
        <p className="text-slate-500 text-xs truncate mb-3">{user?.email}</p>
        <button onClick={() => { logout(); navigate('/login') }}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm transition-colors">
          <LogOut size={16} />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}