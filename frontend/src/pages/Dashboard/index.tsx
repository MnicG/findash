import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'
import { useDashboardSummary, useExchangeRate, useTopNews } from '../../hooks'
import Card from '../../components/ui/Card'
import { TrendingUp, TrendingDown, Users, DollarSign, ShieldCheck, Newspaper } from 'lucide-react'

const RISK_COLORS = {
  conservative: 'bg-blue-100 text-blue-600',
  moderate:     'bg-amber-100 text-amber-600',
  aggressive:   'bg-red-100 text-red-600',
}

function StatCard({ title, value, sub, positive, icon }: {
  title: string; value: string; sub: string; positive?: boolean; icon: React.ReactNode
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <div className="text-slate-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
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
  const { t } = useSettings()
  const { data: summary, isLoading } = useDashboardSummary()
  const { data: usdBrl } = useExchangeRate('USD', 'BRL')
  const { data: news } = useTopNews()

  const totalAUM = summary?.totalAUM ?? 0
  const clients = summary?.clients ?? []

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
          {t('dashboard.welcome')}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard
          title={t('dashboard.totalAUM')}
          value={`$${totalAUM >= 1_000_000 ? (totalAUM / 1_000_000).toFixed(2) + 'M' : totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={isLoading ? t('stocks.loading') : `${t('dashboard.acrossClients')} ${clients.length} ${t('dashboard.clients')}`}
          icon={<DollarSign size={18} />}
        />
        <StatCard
          title={t('dashboard.clientsUp')}
          value={String(summary?.clientsUp ?? 0)}
          sub={`${summary?.clientsDown ?? 0} ${t('dashboard.down')} · ${clients.length - (summary?.clientsUp ?? 0) - (summary?.clientsDown ?? 0)} ${t('dashboard.flat')}`}
          positive={summary ? summary.clientsUp > summary.clientsDown : undefined}
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          title={t('dashboard.totalClients')}
          value={String(clients.length)}
          sub={`${summary?.riskBreakdown.aggressive ?? 0} ${t('dashboard.aggressive')} · ${summary?.riskBreakdown.conservative ?? 0} ${t('dashboard.conservative')}`}
          icon={<Users size={18} />}
        />
        <StatCard
          title="USD / BRL"
          value={usdBrl ? `R$ ${usdBrl.rate.toFixed(4)}` : '—'}
          sub={t('dashboard.liveRate')}
          icon={<Newspaper size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">{t('dashboard.performance')}</h2>
            {isLoading ? (
              <p className="text-slate-400 text-sm">{t('stocks.loading')}</p>
            ) : clients.length === 0 ? (
              <p className="text-slate-400 text-sm">{t('dashboard.noClients')}</p>
            ) : (
              <div className="space-y-1">
                {[...clients]
                  .sort((a, b) => b.dailyChangePct - a.dailyChangePct)
                  .map(c => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/clients/${c.id}`)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.positionCount} {t('dashboard.positions')}{c.positionCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 shrink-0 ml-2">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            ${c.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-slate-400">
                            {c.gainPct >= 0 ? '+' : ''}{c.gainPct.toFixed(2)}% {t('dashboard.allTime')}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-semibold ${
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

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-slate-400" />
            <h2 className="font-semibold text-slate-700 dark:text-slate-200">{t('dashboard.riskProfiles')}</h2>
          </div>
          {(['conservative', 'moderate', 'aggressive'] as const).map(r => {
            const count = summary?.riskBreakdown[r] ?? 0
            const total = clients.length || 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={r} className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RISK_COLORS[r]}`}>
                    {t(`clients.${r}`)}
                  </span>
                  <span className="text-xs text-slate-500">{count} {t('dashboard.clients').slice(0, -1)}{count !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-sm">{t('dashboard.latestNews')}</h3>
            <div className="space-y-3">
              {news?.slice(0, 3).map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                  className="block hover:opacity-70 transition-opacity">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2">{a.title}</p>
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