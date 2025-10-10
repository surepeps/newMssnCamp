import { useSettings } from '../context/SettingsContext.jsx'

function Skeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-mssn-slate/10 bg-white p-6">
      <div className="h-3 w-40 rounded bg-mssn-mist" />
      <div className="mt-3 h-6 w-72 rounded bg-mssn-mist" />
      <div className="mt-2 h-4 w-56 rounded bg-mssn-mist" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-mssn-slate/10 p-4">
            <div className="h-4 w-24 rounded bg-mssn-mist" />
            <div className="mt-2 h-6 w-16 rounded bg-mssn-mist" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CampSettingsPanel() {
  const { settings, loading, error, refresh } = useSettings()

  if (loading) return <Skeleton />
  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Failed to load camp settings. <button onClick={refresh} className="underline">Retry</button>
      </div>
    )
  }
  const camp = settings?.current_camp
  if (!camp) return null

  return (
    <div className="rounded-3xl border border-mssn-slate/10 bg-white p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">{camp.camp_code || 'CAMP'}</span>
          <h3 className="text-xl font-semibold text-mssn-slate">{camp.camp_title}</h3>
          <p className="text-sm text-mssn-slate/70">{camp.camp_theme}</p>
          <p className="text-sm text-mssn-slate/70">{camp.camp_date}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-mssn-slate/10 p-4">
          <div className="text-xs text-mssn-slate/60">TFL</div>
          <div className="text-lg font-semibold text-mssn-slate">₦{Number(camp.prices?.tfl ?? 0).toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-mssn-slate/10 p-4">
          <div className="text-xs text-mssn-slate/60">Secondary</div>
          <div className="text-lg font-semibold text-mssn-slate">₦{Number(camp.prices?.secondary ?? 0).toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-mssn-slate/10 p-4">
          <div className="text-xs text-mssn-slate/60">Undergraduate</div>
          <div className="text-lg font-semibold text-mssn-slate">₦{Number(camp.prices?.undergraduate ?? 0).toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-mssn-slate/10 p-4">
          <div className="text-xs text-mssn-slate/60">Others</div>
          <div className="text-lg font-semibold text-mssn-slate">₦{Number(camp.prices?.others ?? 0).toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}
