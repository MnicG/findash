import { useState } from 'react'
import { useExchangeRate } from '../../hooks'
import Card from '../../components/ui/Card'
import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'

const PAIRS = [
  { from: 'USD', to: 'BRL' }, { from: 'EUR', to: 'BRL' },
  { from: 'EUR', to: 'USD' }, { from: 'GBP', to: 'USD' }, { from: 'BTC', to: 'USD' },
]

function RateCard({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useExchangeRate(from, to)
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{from}</span>
          <ArrowRightLeft size={14} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-800">{to}</span>
        </div>
        {data && (
          <span className={`flex items-center gap-1 text-xs font-medium ${data.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {data.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(4)}%
          </span>
        )}
      </div>
      {isLoading ? <div className="h-8 bg-slate-100 rounded animate-pulse" /> :
        data ? (
          <>
            <p className="text-3xl font-bold text-slate-800">{data.rate.toFixed(4)}</p>
            <p className="text-xs text-slate-400 mt-1">Prev. close: {data.previousClose.toFixed(4)}</p>
          </>
        ) : <p className="text-slate-400 text-sm">Unavailable</p>}
    </Card>
  )
}

export default function Quotes() {
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('BRL')
  const { data: custom, isLoading } = useExchangeRate(from, to)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Quotes</h1>
        <p className="text-slate-500 mt-1">Live currency exchange rates</p>
      </div>

      <Card className="mb-8">
        <h2 className="font-semibold text-slate-700 mb-4">Custom Rate</h2>
        <div className="flex items-center gap-3">
          <input value={from} onChange={(e) => setFrom(e.target.value.toUpperCase())} maxLength={5}
            className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-emerald-500 transition-colors" placeholder="USD" />
          <ArrowRightLeft size={16} className="text-slate-400" />
          <input value={to} onChange={(e) => setTo(e.target.value.toUpperCase())} maxLength={5}
            className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-emerald-500 transition-colors" placeholder="BRL" />
          {isLoading ? <span className="text-slate-400 text-sm ml-4">Loading...</span> :
            custom ? (
              <div className="flex items-center gap-3 ml-4">
                <span className="text-2xl font-bold text-slate-800">{custom.rate.toFixed(4)}</span>
                <span className={`text-sm font-medium ${custom.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {custom.changePercent >= 0 ? '+' : ''}{custom.changePercent.toFixed(4)}%
                </span>
              </div>
            ) : null}
        </div>
      </Card>

      <h2 className="font-semibold text-slate-700 mb-4">Popular Pairs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PAIRS.map(({ from, to }) => <RateCard key={`${from}-${to}`} from={from} to={to} />)}
      </div>
    </div>
  )
}