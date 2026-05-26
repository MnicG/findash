import { useState, useRef, useEffect } from 'react'
import { useExchangeRate } from '../../hooks'
import Card from '../../components/ui/Card'
import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'

const PAIRS = [
  { from: 'USD', to: 'BRL' }, { from: 'EUR', to: 'BRL' },
  { from: 'EUR', to: 'USD' }, { from: 'GBP', to: 'USD' },
]

const CURRENCIES: { code: string; name: string }[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'ARS', name: 'Argentine Peso' },
  { code: 'CLP', name: 'Chilean Peso' },
  { code: 'COP', name: 'Colombian Peso' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'ILS', name: 'Israeli Shekel' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'RON', name: 'Romanian Leu' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'UAH', name: 'Ukrainian Hryvnia' },
  { code: 'TWD', name: 'Taiwan Dollar' },
  { code: 'BTC', name: 'Bitcoin' },
]

function searchCurrencies(query: string) {
  const q = query.toLowerCase()
  return CURRENCIES.filter(
    (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
  ).slice(0, 6)
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (code: string) => void
  placeholder: string
}) {
  const [input, setInput] = useState(value)
  const [suggestions, setSuggestions] = useState<{ code: string; name: string }[]>([])
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setInput(value) }, [value])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleChange = (val: string) => {
    setInput(val)
    const results = searchCurrencies(val)
    setSuggestions(results)
    setOpen(results.length > 0 && val.length > 0)
  }

  const select = (code: string) => {
    setInput(code)
    onChange(code)
    setOpen(false)
    setSuggestions([])
  }

  const handleBlurCommit = () => {
    const upper = input.toUpperCase()
    const match = CURRENCIES.find((c) => c.code === upper)
    if (match) onChange(match.code)
    else setInput(value) // revert if invalid
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        value={input}
        onChange={(e) => handleChange(e.target.value.toUpperCase())}
        onBlur={handleBlurCommit}
        maxLength={5}
        placeholder={placeholder}
        className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:border-emerald-500 transition-colors"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-10 top-full mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((c) => (
            <button
              key={c.code}
              type="button"
              onMouseDown={() => select(c.code)}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between gap-2"
            >
              <span className="font-mono font-semibold text-slate-800 text-sm">{c.code}</span>
              <span className="text-xs text-slate-400 truncate">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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
          <CurrencyInput value={from} onChange={setFrom} placeholder="USD" />
          <ArrowRightLeft size={16} className="text-slate-400" />
          <CurrencyInput value={to} onChange={setTo} placeholder="BRL" />
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