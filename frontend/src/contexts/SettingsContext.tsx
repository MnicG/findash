import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Language = 'en' | 'pt'
type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY'
type Theme = 'light' | 'dark'

interface Settings {
  language: Language
  dateFormat: DateFormat
  theme: Theme
  setLanguage: (l: Language) => void
  setDateFormat: (d: DateFormat) => void
  setTheme: (t: Theme) => void
  t: (key: string) => string
  formatDate: (date: string | Date) => string
}

const translations: Record<string, Record<Language, string>> = {
  // Nav
  'nav.dashboard':    { en: 'Dashboard',   pt: 'Painel' },
  'nav.clients':      { en: 'Clients',     pt: 'Clientes' },
  'nav.stocks':       { en: 'Stocks',      pt: 'Ações' },
  'nav.quotes':       { en: 'Quotes',      pt: 'Cotações' },
  'nav.news':         { en: 'News',        pt: 'Notícias' },
  'nav.settings':     { en: 'Settings',    pt: 'Configurações' },
  'nav.logout':       { en: 'Logout',      pt: 'Sair' },
  // Dashboard
  'dashboard.welcome':       { en: 'Welcome back',                           pt: 'Bem-vindo de volta' },
  'dashboard.subtitle':      { en: "Here's what's happening with your clients today.", pt: 'Veja o que está acontecendo com seus clientes hoje.' },
  'dashboard.totalAUM':      { en: 'Total AUM',                              pt: 'AUM Total' },
  'dashboard.clientsUp':     { en: 'Clients Up Today',                       pt: 'Clientes em Alta' },
  'dashboard.totalClients':  { en: 'Total Clients',                          pt: 'Total de Clientes' },
  'dashboard.performance':   { en: 'Client Portfolio Performance',           pt: 'Desempenho dos Portfólios' },
  'dashboard.riskProfiles':  { en: 'Risk Profiles',                          pt: 'Perfis de Risco' },
  'dashboard.latestNews':    { en: 'Latest News',                            pt: 'Últimas Notícias' },
  'dashboard.noClients':     { en: 'No clients with positions yet.',         pt: 'Nenhum cliente com posições ainda.' },
  'dashboard.positions':     { en: 'position',                               pt: 'posição' },
  'dashboard.allTime':       { en: 'all time',                               pt: 'total' },
  'dashboard.acrossClients': { en: 'Across',                                 pt: 'Entre' },
  'dashboard.clients':       { en: 'clients',                                pt: 'clientes' },
  'dashboard.down':          { en: 'down',                                   pt: 'em queda' },
  'dashboard.flat':          { en: 'flat',                                   pt: 'estável' },
  'dashboard.aggressive':    { en: 'aggressive',                             pt: 'agressivo' },
  'dashboard.conservative':  { en: 'conservative',                           pt: 'conservador' },
  'dashboard.liveRate':      { en: 'Live exchange rate',                     pt: 'Taxa de câmbio ao vivo' },
  // Clients
  'clients.title':           { en: 'Clients',              pt: 'Clientes' },
  'clients.registered':      { en: 'registered clients',   pt: 'clientes cadastrados' },
  'clients.addClient':       { en: 'Add Client',           pt: 'Adicionar Cliente' },
  'clients.noClients':       { en: 'No clients yet.',      pt: 'Nenhum cliente ainda.' },
  'clients.name':            { en: 'Name',                 pt: 'Nome' },
  'clients.email':           { en: 'Email',                pt: 'E-mail' },
  'clients.phone':           { en: 'Phone',                pt: 'Telefone' },
  'clients.riskProfile':     { en: 'Risk Profile',         pt: 'Perfil de Risco' },
  'clients.created':         { en: 'Created',              pt: 'Criado em' },
  'clients.newClient':       { en: 'New Client',           pt: 'Novo Cliente' },
  'clients.editClient':      { en: 'Edit Client',          pt: 'Editar Cliente' },
  'clients.document':        { en: 'Document',             pt: 'Documento' },
  'clients.cancel':          { en: 'Cancel',               pt: 'Cancelar' },
  'clients.saveChanges':     { en: 'Save Changes',         pt: 'Salvar Alterações' },
  'clients.createClient':    { en: 'Create Client',        pt: 'Criar Cliente' },
  'clients.delete':          { en: 'Delete?',              pt: 'Excluir?' },
  'clients.conservative':    { en: 'Conservative',         pt: 'Conservador' },
  'clients.moderate':        { en: 'Moderate',             pt: 'Moderado' },
  'clients.aggressive':      { en: 'Aggressive',           pt: 'Agressivo' },
  // Client detail
  'client.backToClients':    { en: 'Back to Clients',      pt: 'Voltar para Clientes' },
  'client.portfolioValue':   { en: 'Portfolio Value',      pt: 'Valor do Portfólio' },
  'client.totalCost':        { en: 'Total Cost',           pt: 'Custo Total' },
  'client.gainLoss':         { en: 'Gain / Loss',          pt: 'Ganho / Perda' },
  'client.positions':        { en: 'Positions',            pt: 'Posições' },
  'client.addPosition':      { en: 'Add Position',         pt: 'Adicionar Posição' },
  'client.noPositions':      { en: 'No positions yet.',    pt: 'Nenhuma posição ainda.' },
  'client.allocation':       { en: 'Allocation',           pt: 'Alocação' },
  'client.noData':           { en: 'No data yet.',         pt: 'Sem dados ainda.' },
  'client.transactions':     { en: 'Transaction History',  pt: 'Histórico de Transações' },
  'client.noTransactions':   { en: 'No transactions yet.', pt: 'Nenhuma transação ainda.' },
  'client.symbol':           { en: 'Symbol',               pt: 'Símbolo' },
  'client.qty':              { en: 'Qty',                  pt: 'Qtd' },
  'client.avgBuy':           { en: 'Avg Buy',              pt: 'Preço Médio' },
  'client.current':          { en: 'Current',              pt: 'Atual' },
  'client.value':            { en: 'Value',                pt: 'Valor' },
  'client.date':             { en: 'Date',                 pt: 'Data' },
  'client.type':             { en: 'Type',                 pt: 'Tipo' },
  'client.price':            { en: 'Price',                pt: 'Preço' },
  'client.total':            { en: 'Total',                pt: 'Total' },
  'client.stock':            { en: 'Stock',                pt: 'Ação' },
  'client.quantity':         { en: 'Quantity',             pt: 'Quantidade' },
  'client.avgBuyPrice':      { en: 'Average Buy Price ($)', pt: 'Preço Médio de Compra ($)' },
  'client.removePosition':   { en: 'Remove position?',    pt: 'Remover posição?' },
  'client.searchSymbol':     { en: 'Search company or symbol (e.g. Apple, AAPL)', pt: 'Buscar empresa ou símbolo (ex: Apple, PETR4)' },
  // Stocks
  'stocks.title':            { en: 'Stocks',               pt: 'Ações' },
  'stocks.subtitle':         { en: 'Real-time stock prices and history', pt: 'Preços e histórico de ações em tempo real' },
  'stocks.search':           { en: 'Search',               pt: 'Buscar' },
  'stocks.searchPlaceholder':{ en: 'Search company or symbol (e.g. Apple, AAPL)', pt: 'Buscar empresa ou símbolo (ex: Apple, PETR4)' },
  'stocks.prevClose':        { en: 'Previous Close',       pt: 'Fechamento Anterior' },
  'stocks.change':           { en: 'Change',               pt: 'Variação' },
  'stocks.priceHistory':     { en: 'Price History',        pt: 'Histórico de Preços' },
  'stocks.loading':          { en: 'Loading...',           pt: 'Carregando...' },
  'stocks.loadingChart':     { en: 'Loading chart...',     pt: 'Carregando gráfico...' },
  'stocks.notFound':         { en: 'Symbol not found.',    pt: 'Símbolo não encontrado.' },
  // Quotes
  'quotes.title':            { en: 'Quotes',               pt: 'Cotações' },
  'quotes.subtitle':         { en: 'Live currency exchange rates', pt: 'Taxas de câmbio ao vivo' },
  'quotes.customRate':       { en: 'Custom Rate',          pt: 'Taxa Personalizada' },
  'quotes.popularPairs':     { en: 'Popular Pairs',        pt: 'Pares Populares' },
  'quotes.unavailable':      { en: 'Unavailable',          pt: 'Indisponível' },
  'quotes.prevClose':        { en: 'Prev. close:',         pt: 'Fechamento anterior:' },
  // News
  'news.title':              { en: 'News',                 pt: 'Notícias' },
  'news.subtitle':           { en: 'Latest financial and business headlines', pt: 'Últimas manchetes financeiras e empresariais' },
  'news.search':             { en: 'Search',               pt: 'Buscar' },
  'news.searchPlaceholder':  { en: 'Search news (e.g. bitcoin, inflation)', pt: 'Buscar notícias (ex: bitcoin, inflação)' },
  'news.clear':              { en: 'Clear',                pt: 'Limpar' },
  'news.noArticles':         { en: 'No articles found.',   pt: 'Nenhum artigo encontrado.' },
  // Settings
  'settings.title':          { en: 'Settings',             pt: 'Configurações' },
  'settings.subtitle':       { en: 'Customize your experience', pt: 'Personalize sua experiência' },
  'settings.language':       { en: 'Language',             pt: 'Idioma' },
  'settings.languageDesc':   { en: 'Choose your preferred language', pt: 'Escolha seu idioma preferido' },
  'settings.theme':          { en: 'Theme',                pt: 'Tema' },
  'settings.themeDesc':      { en: 'Switch between light and dark mode', pt: 'Alternar entre modo claro e escuro' },
  'settings.dateFormat':     { en: 'Date Format',          pt: 'Formato de Data' },
  'settings.dateFormatDesc': { en: 'Choose how dates are displayed', pt: 'Escolha como as datas são exibidas' },
  'settings.light':          { en: 'Light',                pt: 'Claro' },
  'settings.dark':           { en: 'Dark',                 pt: 'Escuro' },
  // Auth
  'auth.signIn':             { en: 'Sign in to your account', pt: 'Entrar na sua conta' },
  'auth.email':              { en: 'Email',                pt: 'E-mail' },
  'auth.password':           { en: 'Password',             pt: 'Senha' },
  'auth.login':              { en: 'Sign in',              pt: 'Entrar' },
  'auth.signingIn':          { en: 'Signing in...',        pt: 'Entrando...' },
  'auth.noAccount':          { en: "Don't have an account?", pt: 'Não tem uma conta?' },
  'auth.register':           { en: 'Register',             pt: 'Cadastrar' },
  'auth.invalidCredentials': { en: 'Invalid email or password', pt: 'E-mail ou senha inválidos' },
  'auth.createAccount':      { en: 'Create your account',  pt: 'Criar sua conta' },
  'auth.name':               { en: 'Name',                 pt: 'Nome' },
  'auth.creating':           { en: 'Creating account...',  pt: 'Criando conta...' },
  'auth.create':             { en: 'Create account',       pt: 'Criar conta' },
  'auth.hasAccount':         { en: 'Already have an account?', pt: 'Já tem uma conta?' },
  'auth.signInLink':         { en: 'Sign in',              pt: 'Entrar' },
  'auth.error':              { en: 'Email already in use or invalid data', pt: 'E-mail já em uso ou dados inválidos' },
}

const SettingsContext = createContext<Settings>({} as Settings)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() =>
    (localStorage.getItem('language') as Language) || 'en')
  const [dateFormat, setDateFormatState] = useState<DateFormat>(() =>
    (localStorage.getItem('dateFormat') as DateFormat) || 'DD/MM/YYYY')
  const [theme, setThemeState] = useState<Theme>(() =>
    (localStorage.getItem('theme') as Theme) || 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const setLanguage = (l: Language) => { setLanguageState(l); localStorage.setItem('language', l) }
  const setDateFormat = (d: DateFormat) => { setDateFormatState(d); localStorage.setItem('dateFormat', d) }
  const setTheme = (t: Theme) => { setThemeState(t); localStorage.setItem('theme', t) }

  const t = (key: string) => translations[key]?.[language] ?? key

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return dateFormat === 'DD/MM/YYYY' ? `${day}/${month}/${year}` : `${month}/${day}/${year}`
  }

  return (
    <SettingsContext.Provider value={{ language, dateFormat, theme, setLanguage, setDateFormat, setTheme, t, formatDate }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)