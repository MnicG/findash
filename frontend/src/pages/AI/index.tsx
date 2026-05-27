import { useState } from 'react'
import { useClients, useChat, useAnalyzePortfolio, useRebalancePortfolio } from '../../hooks'
import { useSettings } from '../../contexts/SettingsContext'
import type { ChatMessage } from '../../api/ai.api'
import Card from '../../components/ui/Card'
import { Bot, Send, User, Sparkles, RefreshCw, ChevronDown } from 'lucide-react'

export default function AI() {
  const { t } = useSettings()
  const { data: clients = [] } = useClients()
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [analysisResult, setAnalysisResult] = useState('')
  const [analysisType, setAnalysisType] = useState<'analyze' | 'rebalance' | null>(null)

  const chat = useChat()
  const analyze = useAnalyzePortfolio(selectedClientId)
  const rebalance = useRebalancePortfolio(selectedClientId)

  const selectedClient = clients.find(c => c.id === selectedClientId)

  const handleSend = async () => {
    if (!input.trim() || chat.isPending) return
    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    const reply = await chat.mutateAsync({ messages: newMessages, clientId: selectedClientId || undefined })
    setMessages(prev => [...prev, { role: 'assistant', content: reply }])
  }

  const handleAnalyze = async (type: 'analyze' | 'rebalance') => {
    if (!selectedClientId) return
    setAnalysisType(type)
    setAnalysisResult('')
    const result = type === 'analyze'
      ? await analyze.mutateAsync()
      : await rebalance.mutateAsync()
    setAnalysisResult(result)
  }

  const isAnalyzing = analyze.isPending || rebalance.isPending

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">{t('ai.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('ai.subtitle')}</p>
        </div>
      </div>

      {/* Client selector */}
      <Card className="mb-4 md:mb-6">
        <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">{t('ai.clientContext')}</p>
        <div className="relative">
          <select
            value={selectedClientId}
            onChange={e => { setSelectedClientId(e.target.value); setAnalysisResult(''); setAnalysisType(null) }}
            className="w-full appearance-none border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">{t('ai.noClient')}</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} · {c.riskProfile ?? 'moderate'}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </Card>

      {/* Main grid — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* Chat */}
        <Card className="flex flex-col h-[480px] md:h-[520px]">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Bot size={16} className="text-emerald-400" />
            {t('ai.chat')}
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <Bot size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-400">
                  {selectedClient ? t('ai.emptyChatClient') : t('ai.emptyChat')}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === 'user'
                    ? 'bg-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                }`}>
                  {msg.role === 'user'
                    ? <User size={13} className="text-white" />
                    : <Bot size={13} className="text-emerald-400" />}
                </div>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-tr-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chat.isPending && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                  <Bot size={13} className="text-emerald-400" />
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-700">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={t('ai.chatPlaceholder')}
              className="flex-1 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chat.isPending}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white px-3.5 py-2.5 rounded-xl transition-colors"
            >
              <Send size={15} />
            </button>
          </div>

          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="mt-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors self-center"
            >
              {t('ai.clearChat')}
            </button>
          )}
        </Card>

        {/* Portfolio Analysis */}
        <Card className="flex flex-col h-[480px] md:h-[520px]">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" />
            {t('ai.analysis')}
          </h2>

          {!selectedClientId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <Sparkles size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">{t('ai.selectClient')}</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleAnalyze('analyze')}
                  disabled={isAnalyzing}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {analyze.isPending ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {t('ai.analyze')}
                </button>
                <button
                  onClick={() => handleAnalyze('rebalance')}
                  disabled={isAnalyzing}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-emerald-500/30 hover:bg-emerald-500/5 disabled:opacity-50 text-emerald-500 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {rebalance.isPending ? <RefreshCw size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  {t('ai.rebalance')}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isAnalyzing && (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <RefreshCw size={24} className="text-emerald-400 animate-spin" />
                    <p className="text-sm text-slate-400">
                      {analysisType === 'analyze' ? t('ai.analyzing') : t('ai.rebalancing')}
                    </p>
                  </div>
                )}
                {!isAnalyzing && !analysisResult && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <p className="text-sm text-slate-400">{t('ai.analyzeHint')}</p>
                  </div>
                )}
                {!isAnalyzing && analysisResult && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
                      {analysisType === 'analyze' ? t('ai.analysisLabel') : t('ai.rebalanceLabel')} · {selectedClient?.name}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {analysisResult}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}