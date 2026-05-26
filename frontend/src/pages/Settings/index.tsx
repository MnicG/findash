import { useSettings } from '../../contexts/SettingsContext'
import Card from '../../components/ui/Card'
import { Globe, Moon, Calendar } from 'lucide-react'

export default function Settings() {
  const { t, language, setLanguage, theme, setTheme, dateFormat, setDateFormat } = useSettings()

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">{t('settings.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('settings.subtitle')}</p>
      </div>

      <div className="max-w-lg space-y-4">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Globe size={18} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.language')}</p>
                <p className="text-xs text-slate-400">{t('settings.languageDesc')}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {(['en', 'pt'] as const).map(l => (
                <button key={l} onClick={() => setLanguage(l)}
                  className={`px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    language === l
                      ? 'bg-emerald-500 text-white'
                      : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-300'
                  }`}>
                  {l === 'en' ? 'EN' : 'PT'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Moon size={18} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.theme')}</p>
                <p className="text-xs text-slate-400">{t('settings.themeDesc')}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {(['light', 'dark'] as const).map(th => (
                <button key={th} onClick={() => setTheme(th)}
                  className={`px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    theme === th
                      ? 'bg-emerald-500 text-white'
                      : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-300'
                  }`}>
                  {th === 'light' ? t('settings.light') : t('settings.dark')}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Calendar size={18} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.dateFormat')}</p>
                <p className="text-xs text-slate-400">{t('settings.dateFormatDesc')}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {(['DD/MM/YYYY', 'MM/DD/YYYY'] as const).map(df => (
                <button key={df} onClick={() => setDateFormat(df)}
                  className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                    dateFormat === df
                      ? 'bg-emerald-500 text-white'
                      : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-300'
                  }`}>
                  {df}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}