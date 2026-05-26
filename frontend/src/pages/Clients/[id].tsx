import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSettings } from '../../contexts/SettingsContext'
import { clientsApi } from '../../api/clients.api'
import { useClientPositions, useAddPosition, useRemovePosition, useClientTransactions } from '../../hooks'
import { stocksApi } from '../../api/stocks.api'
import Card from '../../components/ui/Card'
import { ArrowLeft, Plus, Trash2, X, TrendingUp, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, formatDate } = useSettings()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string }[]>([])
  const [selected, setSelected] = useState<{ symbol: string; name: string } | null>(null)
  const [quantity, setQuantity] = useState('')
  const [avgBuyPrice, setAvgBuyPrice] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { data: client } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.getById(id!),
    enabled: !!id,
  })

  const { data: positions = [] } = useClientPositions(id!)
  const { data: transactions = [] } = useClientTransactions(id!)
  const addPosition = useAddPosition(id!)
  const removePosition = useRemovePosition(id!)

  const { data: quotes } = useQuery({
    queryKey: ['position-quotes', positions.map(p => p.symbol)],
    queryFn: async () => {
      const results = await Promise.allSettled(positions.map(p => stocksApi.getQuote(p.symbol)))
      return Object.fromEntries(
        results
          .map((r, i) => [positions[i].symbol, r.status === 'fulfilled' ? r.value : null])
          .filter(([, v]) => v !== null)
      )
    },
    enabled: positions.length > 0,
    refetchInterval: 60000,
  })

  useEffect(() => {
    if (search.length < 1) { setSuggestions([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/stocks/search?q=${search}`)
        setSuggestions(res.data)
      } catch { setSuggestions([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setSuggestions([])
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const totalValue = positions.reduce((sum, p) => {
    const price = quotes?.[p.symbol]?.price ?? p.avgBuyPrice
    return sum + price * p.quantity
  }, 0)
  const totalCost = positions.reduce((sum, p) => sum + p.avgBuyPrice * p.quantity, 0)
  const totalGain = totalValue - totalCost
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  const pieData = positions.map(p => ({
    name: p.symbol,
    value: (quotes?.[p.symbol]?.price ?? p.avgBuyPrice) * p.quantity,
  }))

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    await addPosition.mutateAsync({
      symbol: selected.symbol, name: selected.name,
      quantity: parseFloat(quantity), avgBuyPrice: parseFloat(avgBuyPrice),
    })
    setShowModal(false); setSelected(null); setSearch(''); setQuantity(''); setAvgBuyPrice('')
  }

  return (
    <div className="p-4 md:p-8">
      <button onClick={() => navigate('/clients')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 text-sm">
        <ArrowLeft size={16} /> {t('client.backToClients')}
      </button>

      {client && (
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">{client.name}</h1>
          <p className="text-slate-500 text-sm mt-1">{client.email} {client.phone ? `· ${client.phone}` : ''}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card>
          <p className="text-xs text-slate-400 mb-1">{t('client.portfolioValue')}</p>
          <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">${totalValue.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-400 mb-1">{t('client.totalCost')}</p>
          <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">${totalCost.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-400 mb-1">{t('client.gainLoss')}</p>
          <div className={`flex items-center gap-2 ${totalGain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {totalGain >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <p className="text-lg md:text-2xl font-bold">{totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)} ({totalGainPct.toFixed(2)}%)</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200">{t('client.positions')}</h2>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                <Plus size={14} /> {t('client.addPosition')}
              </button>
            </div>
            {positions.length === 0 ? (
              <p className="text-slate-400 text-sm">{t('client.noPositions')}</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700">
                        {[t('client.symbol'), t('client.qty'), t('client.avgBuy'), t('client.current'), t('client.value'), 'G/L', ''].map(h => (
                          <th key={h} className="text-left text-xs font-medium text-slate-400 pb-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map(p => {
                        const currentPrice = (quotes?.[p.symbol]?.price || p.avgBuyPrice) as number
                        const value = currentPrice * p.quantity
                        const gain = (currentPrice - p.avgBuyPrice) * p.quantity
                        const gainPct = ((currentPrice - p.avgBuyPrice) / p.avgBuyPrice) * 100
                        return (
                          <tr key={p.id} className="border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                            <td className="py-3">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{p.symbol}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[100px]">{p.name}</p>
                            </td>
                            <td className="py-3 text-sm text-slate-600 dark:text-slate-300">{p.quantity}</td>
                            <td className="py-3 text-sm text-slate-600 dark:text-slate-300">${p.avgBuyPrice.toFixed(2)}</td>
                            <td className="py-3 text-sm text-slate-600 dark:text-slate-300">${currentPrice.toFixed(2)}</td>
                            <td className="py-3 text-sm font-medium text-slate-700 dark:text-slate-200">${value.toFixed(2)}</td>
                            <td className={`py-3 text-sm font-medium ${gain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {gain >= 0 ? '+' : ''}${gain.toFixed(2)} ({gainPct.toFixed(1)}%)
                            </td>
                            <td className="py-3">
                              <button onClick={() => { if (confirm(t('client.removePosition'))) removePosition.mutate(p.id) }}
                                className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {positions.map(p => {
                    const currentPrice = (quotes?.[p.symbol]?.price || p.avgBuyPrice) as number
                    const gain = (currentPrice - p.avgBuyPrice) * p.quantity
                    const gainPct = ((currentPrice - p.avgBuyPrice) / p.avgBuyPrice) * 100
                    return (
                      <div key={p.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{p.symbol}</p>
                          <p className="text-xs text-slate-400">{p.quantity} @ ${p.avgBuyPrice.toFixed(2)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t('client.current')}: ${currentPrice.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${gain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {gain >= 0 ? '+' : ''}${gain.toFixed(2)}
                            </p>
                            <p className={`text-xs ${gain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{gainPct.toFixed(1)}%</p>
                          </div>
                          <button onClick={() => { if (confirm(t('client.removePosition'))) removePosition.mutate(p.id) }}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </Card>
        </div>

        <Card>
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">{t('client.allocation')}</h2>
          {pieData.length === 0 ? (
            <p className="text-slate-400 text-sm">{t('client.noData')}</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => `$${(v as number).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-300">{d.name}</span>
                    </div>
                    <span className="text-slate-500">{((d.value / totalValue) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">{t('client.transactions')}</h2>
        {transactions.length === 0 ? (
          <p className="text-slate-400 text-sm">{t('client.noTransactions')}</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    {[t('client.date'), t('client.type'), t('client.symbol'), t('client.qty'), t('client.price'), t('client.total')].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-slate-400 pb-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                      <td className="py-3 text-sm text-slate-400">{formatDate(tx.date)}</td>
                      <td className="py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${tx.type === 'buy' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-sm font-medium text-slate-700 dark:text-slate-200">{tx.symbol}</td>
                      <td className="py-3 text-sm text-slate-600 dark:text-slate-300">{tx.quantity}</td>
                      <td className="py-3 text-sm text-slate-600 dark:text-slate-300">${tx.price.toFixed(2)}</td>
                      <td className="py-3 text-sm font-medium text-slate-700 dark:text-slate-200">${(tx.quantity * tx.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tx.type === 'buy' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {tx.type.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{tx.symbol}</span>
                    </div>
                    <p className="text-xs text-slate-400">{formatDate(tx.date)} · {tx.quantity} @ ${tx.price.toFixed(2)}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">${(tx.quantity * tx.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('client.addPosition')}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddPosition} className="space-y-4">
              <div ref={wrapperRef}>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">{t('client.stock')}</label>
                {selected ? (
                  <div className="flex items-center justify-between border border-emerald-300 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{selected.symbol} — {selected.name}</span>
                    <button type="button" onClick={() => { setSelected(null); setSearch('') }} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="relative">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder={t('client.searchSymbol')}
                      className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden">
                        {suggestions.map(s => (
                          <button key={s.symbol} type="button" onClick={() => { setSelected(s); setSearch(''); setSuggestions([]) }}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center justify-between">
                            <span className="font-medium text-slate-800 dark:text-slate-100 text-sm">{s.symbol}</span>
                            <span className="text-xs text-slate-400 truncate ml-2">{s.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">{t('client.quantity')}</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0.01" step="any"
                  className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">{t('client.avgBuyPrice')}</label>
                <input type="number" value={avgBuyPrice} onChange={e => setAvgBuyPrice(e.target.value)} required min="0.01" step="any"
                  className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                  {t('clients.cancel')}
                </button>
                <button type="submit" disabled={!selected}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium">
                  {t('client.addPosition')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}