import { createContext, useState, useEffect, useMemo, useContext } from 'react'
import { fetchJSON } from '../services/api.js'

const SettingsContext = createContext({ settings: null, loading: true, error: null, refresh: () => {} })

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  useEffect(() => {
    load()
  }, [])

  const value = useMemo(() => ({ settings, loading, error, refresh: load }), [settings, loading, error])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}
