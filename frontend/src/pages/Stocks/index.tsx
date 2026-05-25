import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import { useStockQuote, useStockHistory } from '../../hooks'
import Card from '../../components/ui/Card'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const POPULAR = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'PETR4.SA', 'VALE3.SA']
const RANGES = ['1d', '1mo', '3mo', '6mo', '1y']

export default function Stocks() {
  const [search, setSearch] = useState('')
  const [symbol, setSymbol] = useState('AAPL')
  const [range, setRange] = useState('1mo')
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol)
  const { data: history, isLoading: histLoading } = useStockHistory(symbol, range)

  useEffect(() => {
    if (search.length < 1) { setSuggestions([]); setShowSuggestions(false); return }
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/stocks/search?q=${search}`)
        setSuggestions(res.data)
        setShowSuggestions(true)
      } catch { setSuggestions([]) }
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectSymbol = (s: string) => {
    setSymbol(s)
    setSearch('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) selectSymbol(search.trim().toUpperCase())
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Stocks</h1>
        <p className="text-slate-500 mt-1">Real-time stock prices and history</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm" ref={wrapperRef}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search company or symbol (e.g. Apple, AAPL)"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              {suggestions.map((s) => (
                <button key={s.symbol} type="button" onClick={() => selectSymbol(s.symbol)}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between">
                  <span className="font-medium text-slate-800 text-sm">{s.symbol}</span>
                  <span className="text-xs text-slate-400 truncate ml-2">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Search</button>
      </form>

      <div className="flex flex-wrap gap-2 mb-6">
        {POPULAR.map((s) => (
          <button key={s} onClick={() => selectSymbol(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              symbol === s ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
            }`}>{s}</button>
        ))}
      </div>

     {quoteLoading ? (
  <p className="text-slate-400 text-sm">Loading...</p>
) : quote && quote.price != null ? (<>
  <Card className="mb-6">
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold text-slate-800">{quote.symbol}</h2>
          <span className="text-sm text-slate-400">{quote.exchange}</span>
        </div>
        <p className="text-slate-500 text-sm mb-4">{quote.name}</p>
        <p className="text-4xl font-bold text-slate-800">
          {quote.currency === 'BRL' ? 'R$' : '$'} {quote.price.toFixed(2)}
        </p>
      </div>
      <div className={`flex items-center gap-2 text-lg font-semibold ${quote.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        {quote.changePercent >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
      <div>
        <p className="text-xs text-slate-400">Previous Close</p>
        <p className="text-sm font-semibold text-slate-700">{quote.previousClose.toFixed(2)}</p>
      </div>
      <div>
        <p className="text-xs text-slate-400">Change</p>
        <p className={`text-sm font-semibold ${quote.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}
        </p>
      </div>
    </div>
  </Card>

  <Card>
    <div className="flex items-center justify-between mb-6">
      <h3 className="font-semibold text-slate-700">Price History</h3>
      <div className="flex gap-1">
        {RANGES.map((r) => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              range === r ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}>{r}</button>
        ))}
      </div>
    </div>
    {histLoading ? (
      <p className="text-slate-400 text-sm">Loading chart...</p>
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
          <Line type="monotone" dataKey="close" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    )}
  </Card>
</>) : (
  <p className="text-slate-400 text-sm">Symbol not found.</p>
)}

 </div>
  )
}