import * as React from 'react'
import { useSettings } from '../context/SettingsContext.jsx'
import { isValidDate } from '../utils/registration.js'

function StatusPill({ variant = 'error', children }) {
  const map = {
    error: 'bg-red-100 text-red-700 border-red-200',
    closed: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-amber-100 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${map[variant]}`}>{children}</span>
  )
}

export default function RegistrationBoundary() {
  const { settings, loading, error, refresh } = useSettings()

  const state = React.useMemo(() => {
    if (loading) return { type: 'loading', shouldGate: false }
    if (error) return { type: 'error', shouldGate: true, message: String(error) }

    const camp = settings?.current_camp
    if (!camp) return { type: 'ok', shouldGate: false }

    const endValid = isValidDate(camp.registration_end)
    const isExpired = endValid ? new Date() > new Date(camp.registration_end) : false
    if (isExpired) {
      return { type: 'closed', shouldGate: true, camp }
    }

    return { type: 'ok', shouldGate: false }
  }, [settings, loading, error])

  if (!state.shouldGate) return null

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen w-screen items-center justify-center bg-mssn-night/90 p-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-4xl border border-white/10 bg-white/95">
        <div className="h-1 w-full bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="p-8 text-center">
          {state.type === 'error' && (
            <>
              <StatusPill variant="error">Settings Load Failed</StatusPill>
              <h1 className="mt-3 text-2xl font-semibold text-mssn-slate">We couldn't load camp settings</h1>
              <p className="mt-2 text-sm text-mssn-slate/70">Please check your connection and try again. If the issue persists, contact support.</p>
              <div className="mt-5 inline-flex items-center justify-center rounded-2xl border border-mssn-slate/10 bg-mssn-mist px-3 py-2 text-xs text-mssn-slate/80">{state.message}</div>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button onClick={refresh} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-6 py-3 text-sm font-semibold text-white">Retry</button>
                <a href="#/" className="inline-flex items-center justify-center rounded-full border border-mssn-slate/20 px-6 py-3 text-sm font-semibold text-mssn-slate">Go to Home</a>
              </div>
            </>
          )}

          {state.type === 'closed' && (
            <>
              <StatusPill variant="closed">Registration Closed</StatusPill>
              <h1 className="mt-3 text-2xl font-semibold text-mssn-slate">Registration is no longer available</h1>
              <p className="mt-2 text-sm text-mssn-slate/70">{state.camp?.camp_title ? `${state.camp.camp_title} — ${state.camp.camp_date}` : 'The current camp has ended its registration window.'}</p>
              {isValidDate(state.camp?.registration_end) && (
                <p className="mt-1 text-xs text-mssn-slate/60">Closed on {new Date(state.camp.registration_end).toLocaleString('en-NG')}</p>
              )}
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <a href="#/" className="inline-flex items-center justify-center rounded-full bg-mssn-mist px-6 py-3 text-sm font-semibold text-mssn-slate">Return Home</a>
                <a href="#ads" className="inline-flex items-center justify-center rounded-full border border-mssn-green/30 px-6 py-3 text-sm font-semibold text-mssn-greenDark">View Partner Offers</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
