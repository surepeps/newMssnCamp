import { useSettings } from '../context/SettingsContext.jsx'
import { isValidDate } from '../utils/registration.js'

function PriceCard({ label, original, discounted, quota }) {
  const origNum = original == null ? null : Number(original)
  const hasDiscount = discounted != null && origNum != null && Number(discounted) < origNum
  const available = origNum != null && origNum > 0

  if (!available) {
    return (
      <div className="rounded-2xl border border-mssn-slate/10 bg-mssn-mist p-4 opacity-70">
        <div className="text-xs text-mssn-slate/60">{label}</div>
        <div className="mt-4 text-sm font-semibold text-rose-600">Not available</div>
        <div className="mt-2 text-xs text-mssn-slate/60">This category is currently not available or has been cancelled.</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-mssn-slate/10 bg-white p-4">
      <div className="text-xs text-mssn-slate/60">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-lg font-semibold text-mssn-slate">₦{Number(hasDiscount ? discounted : original).toFixed(2)}</div>
        {hasDiscount && (
          <div className="text-xs text-mssn-slate/60 line-through">₦{Number(original).toFixed(2)}</div>
        )}
      </div>
      <div className="mt-2 text-xs text-mssn-slate/60">Quota: {quota == null ? 'Unlimited' : quota}</div>
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
            Discounts & Quotas
          </span>
          <h2 id="discounts-heading" className="mt-2 text-2xl font-semibold text-mssn-slate">Special pricing and quotas</h2>
          {deadline && (
            <p className="text-sm text-mssn-slate/70">Discount deadline: {deadline.toLocaleDateString('en-NG')}</p>
          )}
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PriceCard label="TFL" original={camp.prices?.tfl} discounted={camp.discounts?.price_tfl} quota={camp.quotas?.tfl} />
        <PriceCard label="Secondary" original={camp.prices?.secondary} discounted={camp.discounts?.price_sec} quota={camp.quotas?.secondary} />
        <PriceCard label="Undergraduate" original={camp.prices?.undergraduate} discounted={camp.discounts?.price_und} quota={camp.quotas?.undergraduate} />
        <PriceCard label="Others" original={camp.prices?.others} discounted={camp.discounts?.price_oth} quota={camp.quotas?.others} />
      </div>
    </section>
  )
}
