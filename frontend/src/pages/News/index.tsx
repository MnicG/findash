import { useState } from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import { useTopNews, useSearchNews } from '../../hooks'
import Card from '../../components/ui/Card'
import { Search, ExternalLink } from 'lucide-react'

export default function News() {
  const { t, formatDate } = useSettings()
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const { data: topNews, isLoading: topLoading } = useTopNews()
  const { data: searchResults, isLoading: searchLoading } = useSearchNews(submitted)
  const articles = submitted ? searchResults : topNews
  const loading = submitted ? searchLoading : topLoading

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('news.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('news.subtitle')}</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(query.trim()) }} className="flex gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t('news.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
        </div>
        <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          {t('news.search')}
        </button>
        {submitted && (
          <button type="button" onClick={() => { setQuery(''); setSubmitted('') }}
            className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            {t('news.clear')}
          </button>
        )}
      </form>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-full mb-2" />
              <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : !articles?.length ? (
        <Card><p className="text-slate-400 text-sm">{t('news.noArticles')}</p></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {articles.filter(a => a.title !== '[Removed]').map((article, i) => (
            <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
              className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">{article.title}</p>
                  {article.description && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{article.description}</p>}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">{article.source}</span>
                    <span className="text-xs text-slate-400">{formatDate(article.publishedAt)}</span>
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