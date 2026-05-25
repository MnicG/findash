import { useAuth } from '../../contexts/AuthContext'
import { useClients, useExchangeRate, useTopNews } from '../../hooks'
import Card from '../../components/ui/Card'
import { TrendingUp, TrendingDown } from 'lucide-react'

function StatCard({ title, value, sub, positive }: {
  title: string; value: string; sub: string; positive?: boolean
}) {
  return (
    <Card>
      <p className="text-slate-500 text-sm font-medium mb-3">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className={`text-sm mt-1 flex items-center gap-1 ${
        positive === undefined ? 'text-slate-400' : positive ? 'text-emerald-500' : 'text-red-500'
      }`}>
        {positive !== undefined && (positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />)}
        {sub}
      </p>
    </Card>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: clients } = useClients()
  const { data: usdBrl } = useExchangeRate('USD', 'BRL')
  const { data: news, isLoading: newsLoading } = useTopNews()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Here's what's happening in the markets today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Clients" value={String(clients?.length ?? 0)} sub="Registered clients" />
        <StatCard title="USD/BRL" value={usdBrl ? `R$ ${usdBrl.rate.toFixed(4)}` : '—'}
          sub={usdBrl ? `${usdBrl.changePercent >= 0 ? '+' : ''}${usdBrl.changePercent.toFixed(4)}%` : 'Loading...'}
          positive={usdBrl ? usdBrl.changePercent >= 0 : undefined} />
        <StatCard title="News" value={String(news?.length ?? 0)} sub="Top headlines today" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-slate-700 mb-4">Recent Clients</h2>
          {!clients?.length ? <p className="text-slate-400 text-sm">No clients yet.</p> : (
            <div className="space-y-3">
              {clients.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.name}</p>
                    <p className="text-xs text-slate.400">{c.email}</p>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-700 mb-4">Latest News</h2>
          {newsLoading ? <p className="text-slate-400 text-sm">Loading...</p> : (
            <div className="space-y-3">
              {news?.slice(0, 5).map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                  className="block py-2 border-b border-slate-100 last:border-0 hover:opacity-70 transition-opacity">
                  <p className="text-sm font-medium text-slate-700 line-clamp-2">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{a.source}</p>
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}