import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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

  // fetch live prices for all positions
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
  const t = setTimeout(async () => {
    try {
      const res = await api.get(`/stocks/search?q=${search}`)
      setSuggestions(res.data)
    } catch { setSuggestions([]) }
  }, 300)
  return () => clearTimeout(t)
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
      symbol: selected.symbol,
      name: selected.name,
      quantity: parseFloat(quantity),
      avgBuyPrice: parseFloat(avgBuyPrice),
    })
    setShowModal(false)
    setSelected(null)
    setSearch('')
    setQuantity('')
    setAvgBuyPrice('')
  }

  return (
    <div className="p-8">
      <button onClick={() => navigate('/clients')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Clients
      </button>

      {client && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">{client.name}</h1>
          <p className="text-slate-500 text-sm mt-1">{client.email} {client.phone ? `· ${client.phone}` : ''}</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-xs text-slate-400 mb-1">Portfolio Value</p>
          <p className="text-2xl font-bold text-slate-800">${totalValue.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-400 mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-slate-800">${totalCost.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-400 mb-1">Gain / Loss</p>
          <div className={`flex items-center gap-2 ${totalGain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {totalGain >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <p className="text-2xl font-bold">{totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)} ({totalGainPct.toFixed(2)}%)</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Positions table */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700">Positions</h2>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                <Plus size={14} /> Add Position
              </button>
            </div>
            {positions.length === 0 ? (
              <p className="text-slate-400 text-sm">No positions yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Symbol', 'Qty', 'Avg Buy', 'Current', 'Value', 'G/L', ''].map(h => (
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
                      <tr key={p.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-3">
                          <p className="text-sm font-bold text-slate-800">{p.symbol}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[100px]">{p.name}</p>
                        </td>
                        <td className="py-3 text-sm text-slate-600">{p.quantity}</td>
                        <td className="py-3 text-sm text-slate-600">${p.avgBuyPrice.toFixed(2)}</td>
                        <td className="py-3 text-sm text-slate-600">${currentPrice.toFixed(2)}</td>
                        <td className="py-3 text-sm font-medium text-slate-700">${value.toFixed(2)}</td>
                        <td className={`py-3 text-sm font-medium ${gain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {gain >= 0 ? '+' : ''}${gain.toFixed(2)} ({gainPct.toFixed(1)}%)
                        </td>
                        <td className="py-3">
                          <button onClick={() => { if (confirm('Remove position?')) removePosition.mutate(p.id) }}
                            className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* Allocation chart */}
        <Card>
          <h2 className="font-semibold text-slate-700 mb-4">Allocation</h2>
          {pieData.length === 0 ? (
            <p className="text-slate-400 text-sm">No data yet.</p>
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
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="text-slate-500">{((d.value / totalValue) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <h2 className="font-semibold text-slate-700 mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-slate-400 text-sm">No transactions yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Date', 'Type', 'Symbol', 'Qty', 'Price', 'Total'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 pb-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 text-sm text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.type === 'buy' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-medium text-slate-700">{t.symbol}</td>
                  <td className="py-3 text-sm text-slate-600">{t.quantity}</td>
                  <td className="py-3 text-sm text-slate-600">${t.price.toFixed(2)}</td>
                  <td className="py-3 text-sm font-medium text-slate-700">${(t.quantity * t.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Add Position Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Add Position</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddPosition} className="space-y-4">
              <div ref={wrapperRef}>
                <label className="block text-sm text-slate-600 mb-1">Stock</label>
                {selected ? (
                  <div className="flex items-center justify-between border border-emerald-300 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-slate-800">{selected.symbol} — {selected.name}</span>
                    <button type="button" onClick={() => { setSelected(null); setSearch('') }} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="relative">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search company or symbol (e.g. Apple, AAPL)"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                        {suggestions.map(s => (
                          <button key={s.symbol} type="button" onClick={() => { setSelected(s); setSearch(''); setSuggestions([]) }}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between">
                            <span className="font-medium text-slate-800 text-sm">{s.symbol}</span>
                            <span className="text-xs text-slate-400 truncate ml-2">{s.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Quantity</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0.01" step="any"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Average Buy Price ($)</label>
                <input type="number" value={avgBuyPrice} onChange={e => setAvgBuyPrice(e.target.value)} required min="0.01" step="any"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={!selected}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium">
                  Add Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}