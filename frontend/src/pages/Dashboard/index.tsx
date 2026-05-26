import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useDashboardSummary, useExchangeRate, useTopNews } from '../../hooks'
import Card from '../../components/ui/Card'
import { TrendingUp, TrendingDown, Users, DollarSign, ShieldCheck, Newspaper } from 'lucide-react'

const RISK_COLORS = {
  conservative: 'bg-blue-100 text-blue-600',
  moderate:     'bg-amber-100 text-amber-600',
  aggressive:   'bg-red-100 text-red-600',
}

const RISK_LABELS = {
  conservative: 'Conservative',
  moderate:     'Moderate',
  aggressive:   'Aggressive',
}

function StatCard({ title, value, sub, positive, icon }: {
  title: string; value: string; sub: string; positive?: boolean; icon: React.ReactNode
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <div className="text-slate-400">{icon}</div>
      </div>
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
  const navigate = useNavigate()
  const { data: summary, isLoading } = useDashboardSummary()
  const { data: usdBrl } = useExchangeRate('USD', 'BRL')
  const { data: news } = useTopNews()

  const totalAUM = summary?.totalAUM ?? 0
  const clients = summary?.clients ?? []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your clients today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total AUM"
          value={`$${totalAUM >= 1_000_000 ? (totalAUM / 1_000_000).toFixed(2) + 'M' : totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={isLoading ? 'Loading...' : `Across ${clients.length} clients`}
          icon={<DollarSign size={18} />}
        />
        <StatCard
          title="Clients Up Today"
          value={String(summary?.clientsUp ?? 0)}
          sub={`${summary?.clientsDown ?? 0} down · ${clients.length - (summary?.clientsUp ?? 0) - (summary?.clientsDown ?? 0)} flat`}
          positive={summary ? summary.clientsUp > summary.clientsDown : undefined}
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          title="Total Clients"
          value={String(clients.length)}
          sub={`${summary?.riskBreakdown.aggressive ?? 0} aggressive · ${summary?.riskBreakdown.conservative ?? 0} conservative`}
          icon={<Users size={18} />}
        />
        <StatCard
          title="USD / BRL"
          value={usdBrl ? `R$ ${usdBrl.rate.toFixed(4)}` : '—'}
          sub="Live exchange rate"
          icon={<Newspaper size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Client leaderboard */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="font-semibold text-slate-700 mb-4">Client Portfolio Performance</h2>
            {isLoading ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : clients.length === 0 ? (
              <p className="text-slate-400 text-sm">No clients with positions yet.</p>
            ) : (
              <div className="space-y-1">
                {[...clients]
                  .sort((a, b) => b.dailyChangePct - a.dailyChangePct)
                  .map(c => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/clients/${c.id}`)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.positionCount} position{c.positionCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-700">
                            ${c.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-slate-400">
                            {c.gainPct >= 0 ? '+' : ''}{c.gainPct.toFixed(2)}% all time
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-semibold w-20 justify-end ${
                          c.dailyChangePct > 0 ? 'text-emerald-500' : c.dailyChangePct < 0 ? 'text-red-500' : 'text-slate-400'
                        }`}>
                          {c.dailyChangePct > 0 ? <TrendingUp size={14} /> : c.dailyChangePct < 0 ? <TrendingDown size={14} /> : null}
                          {c.dailyChangePct > 0 ? '+' : ''}{c.dailyChangePct.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>

        {/* Risk profile breakdown */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-slate-400" />
            <h2 className="font-semibold text-slate-700">Risk Profiles</h2>
          </div>
          {(['conservative', 'moderate', 'aggressive'] as const).map(r => {
            const count = summary?.riskBreakdown[r] ?? 0
            const total = clients.length || 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={r} className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RISK_COLORS[r]}`}>
                    {RISK_LABELS[r]}
                  </span>
                  <span className="text-xs text-slate-500">{count} client{count !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      r === 'conservative' ? 'bg-blue-400' : r === 'moderate' ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Latest News</h3>
            <div className="space-y-3">
              {news?.slice(0, 3).map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                  className="block hover:opacity-70 transition-opacity">
                  <p className="text-xs font-medium text-slate-700 line-clamp-2">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.source}</p>
                </a>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}