import * as React from 'react'
import { useSettings } from '../context/SettingsContext.jsx'
import { isValidDate, getCategoryInfo } from '../utils/registration.js'

function PriceCard({ label, info }) {
  const origNum = info?.original == null ? null : Number(info.original)
  const finalPrice = info?.final
  const finalNum = finalPrice == null ? null : Number(finalPrice)
  const hasDiscount = info?.discountActive && info?.discounted != null && origNum != null && Number(info.discounted) < origNum
  const available = origNum != null && origNum > 0

  if (!available) {
    return (
      <div className="rounded-2xl border border-mssn-slate/10 bg-mssn-mist p-4 opacity-70">
        <div className="text-xs text-mssn-slate/60">{label}</div>
        <div className="mt-3 text-sm font-semibold text-rose-600">Not available</div>
        <div className="mt-1 text-xs text-mssn-slate/60">
          This category is currently not available or has been cancelled.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-mssn-slate/10 bg-white p-4">
      <div className="text-xs text-mssn-slate/60">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-2xl font-bold text-mssn-slate">
          ₦{Number(finalNum ?? origNum).toFixed(2)}
        </div>
        {hasDiscount && (
          <div className="text-sm text-mssn-slate/50 line-through">
            ₦{Number(origNum).toFixed(2)}
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-mssn-slate/60">
        {typeof info.quota === 'number' ? (`${info.used}/${info.quota} registered • ${info.remaining} remaining`) : 'Quota: N/A'}
      </div>
    </div>
  )
}

export default function PricingDiscounts() {
  const { settings } = useSettings()
  const camp = settings?.current_camp || null

  const categories = React.useMemo(() => ['tfl', 'secondary', 'undergraduate', 'others'], [])
  const priceInfos = React.useMemo(() => (
    categories.map((key) => ({ key, info: getCategoryInfo({ camp, discountsMap: settings?.discounts, categoryKey: key }) }))
  ), [camp, settings?.discounts, categories])

  const hasDiscount = React.useMemo(() => priceInfos.some((p) => {
    const i = p.info
    if (!i || i.original == null || i.discounted == null) return false
    const orig = Number(i.original)
    const disc = Number(i.discounted)
    return i.discountActive && Number.isFinite(orig) && Number.isFinite(disc) && disc < orig
  }), [priceInfos])

  const deadline = React.useMemo(() => {
    const d = camp?.discounts?.deadline
    return isValidDate(d) ? new Date(d) : null
  }, [camp])

  const [nowTs, setNowTs] = React.useState(() => Date.now())
  React.useEffect(() => {
    if (!hasDiscount || !deadline) return
    const id = setInterval(() => setNowTs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [hasDiscount, deadline])

  const remainingMs = React.useMemo(() => deadline ? (deadline.getTime() - nowTs) : 0, [deadline, nowTs])
  const showCountdown = hasDiscount && deadline && remainingMs > 0
  const timeLeft = React.useMemo(() => {
    const ms = Math.max(0, remainingMs)
    const totalSeconds = Math.floor(ms / 1000)
    const days = Math.floor(totalSeconds / (24 * 3600))
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return { days, hours, minutes, seconds }
  }, [remainingMs])

  const quotaSummary = React.useMemo(() => {
    const labelMap = { tfl: 'TFL', secondary: 'Secondary', undergraduate: 'Undergraduate', others: 'Others' }
    const parts = priceInfos
      .filter((p) => typeof p.info?.quota === 'number')
      .map((p) => `${labelMap[p.key]} ${p.info.used}/${p.info.quota} • ${p.info.remaining} remaining`)
    return parts
  }, [priceInfos])

  if (!camp) return null

  return (
    <section className="mx-auto mt-10 w-full max-w-6xl px-6" aria-labelledby="discounts-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
            Discounts
          </span>
          <h2 id="discounts-heading" className="mt-2 text-2xl font-semibold text-mssn-slate">Special pricing</h2>
          {deadline && (
            <p className="text-sm text-mssn-slate/70">Discount deadline: {deadline.toLocaleDateString('en-NG')}</p>
          )}
        </div>

        {/* Countdown banner moved here with more prominent notifying style */}
        {showCountdown ? (
          <div className="mt-3 sm:mt-0 flex items-center gap-3">
            <div className="rounded-2xl bg-amber-600/95 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white font-bold">⚡</div>
                <div className="text-left">
                  <div className="text-xs">Discount ends in</div>
                  <div className="mt-0.5 text-sm font-bold">{timeLeft.days}d {String(timeLeft.hours).padStart(2,'0')}h {String(timeLeft.minutes).padStart(2,'0')}m {String(timeLeft.seconds).padStart(2,'0')}s</div>
                </div>
              </div>
            </div>
            {quotaSummary.length ? (
              <div className="rounded-2xl bg-white/6 px-3 py-2 text-xs font-medium text-mssn-slate">{quotaSummary.join(' • ')}</div>
            ) : null}
          </div>
        ) : null}

      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PriceCard label="TFL" info={getCategoryInfo({ camp, discountsMap: settings?.discounts, categoryKey: 'tfl' })} />
        <PriceCard label="Secondary" info={getCategoryInfo({ camp, discountsMap: settings?.discounts, categoryKey: 'secondary' })} />
        <PriceCard label="Undergraduate" info={getCategoryInfo({ camp, discountsMap: settings?.discounts, categoryKey: 'undergraduate' })} />
        <PriceCard label="Others" info={getCategoryInfo({ camp, discountsMap: settings?.discounts, categoryKey: 'others' })} />
      </div>
    </section>
  )
}
