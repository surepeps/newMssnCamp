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
  const camp = settings?.current_camp
  if (!camp) return null

  const deadline = isValidDate(camp.discounts?.deadline) ? new Date(camp.discounts.deadline) : null

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
