import * as React from 'react'
import { fetchJSON } from '../services/api.js'

const SettingsContext = React.createContext({ settings: null, loading: true, error: null, refresh: () => {} })

export function SettingsProvider({ children }) {
  const [settings, setSettings] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchJSON('/settings/website')
      setSettings(data?.settings ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  const value = React.useMemo(() => ({ settings, loading, error, refresh: load }), [settings, loading, error])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return React.useContext(SettingsContext)
}
