import { useState } from 'react'
import { useTopNews, useSearchNews } from '../../hooks'
import Card from '../../components/ui/Card'
import { Search, ExternalLink } from 'lucide-react'

export default function News() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const { data: topNews, isLoading: topLoading } = useTopNews()
  const { data: searchResults, isLoading: searchLoading } = useSearchNews(submitted)
  const articles = submitted ? searchResults : topNews
  const loading = submitted ? searchLoading : topLoading

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">News</h1>
        <p className="text-slate-500 mt-1">Latest financial and business headlines</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(query.trim()) }} className="flex gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news (e.g. bitcoin, inflation)"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
        </div>
        <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Search</button>
        {submitted && (
          <button type="button" onClick={() => { setQuery(''); setSubmitted('') }}
            className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Clear</button>
        )}
      </form>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-full mb-2" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : !articles?.length ? (
        <Card><p className="text-slate-400 text-sm">No articles found.</p></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {articles.filter(a => a.title !== '[Removed]').map((article, i) => (
            <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
              className="block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">{article.title}</p>
                  {article.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{article.description}</p>}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{article.source}</span>
                    <span className="text-xs text-slate-400">{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-400 transition-colors shrink-0 mt-1" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}