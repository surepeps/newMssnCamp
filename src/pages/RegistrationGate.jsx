import { useMemo } from 'react'
import { useMemo } from 'react'
import { isModifiedEvent, navigate } from '../utils/navigation.js'
import { useSettings } from '../context/SettingsContext.jsx'
import { isValidDate, isRegistrationOpen } from '../utils/registration.js'

function StatusBadge({ status }) {
  const map = {
    open: 'bg-green-100 text-green-700 border-green-200',
    upcoming: 'bg-amber-100 text-amber-700 border-amber-200',
    closed: 'bg-red-100 text-red-700 border-red-200',
  }
  const label = status === 'open' ? 'Registration Open' : status === 'upcoming' ? 'Registration Not Yet Open' : 'Registration Closed'
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${map[status]}`}>{label}</span>
}

function Countdown({ start }) {
  const parts = useMemo(() => {
    const now = new Date()
    const diff = Math.max(0, new Date(start).getTime() - now.getTime())
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return { days, hours, minutes }
  }, [start])
  return (
    <div className="flex gap-3 text-sm text-mssn-slate/80">
      <div><span className="text-mssn-slate font-semibold">{parts.days}</span> days</div>
      <div><span className="text-mssn-slate font-semibold">{parts.hours}</span> hrs</div>
      <div><span className="text-mssn-slate font-semibold">{parts.minutes}</span> mins</div>
    </div>
  )
}

function PriceBox({ label, price, discounted, quota }) {
  const hasDiscount = discounted != null && Number(discounted) < Number(price)
  return (
    <div className="rounded-2xl border border-mssn-slate/10 bg-white p-4">
      <div className="text-xs text-mssn-slate/60">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-lg font-semibold text-mssn-slate">₦{Number(hasDiscount ? discounted : price).toFixed(2)}</div>
        {hasDiscount && <div className="text-xs text-mssn-slate/60 line-through">₦{Number(price).toFixed(2)}</div>}
      </div>
      <div className="mt-1 text-xs text-mssn-slate/60">Quota: {quota == null ? 'Unlimited' : quota}</div>
    </div>
  )
}

export default function RegistrationGate() {
  const { settings, loading } = useSettings()
  const camp = settings?.current_camp

  const startValid = isValidDate(camp?.registration_start)
  const endValid = isValidDate(camp?.registration_end)
  const open = isRegistrationOpen(camp)
  const status = open ? 'open' : startValid && new Date() < new Date(camp.registration_start) ? 'upcoming' : 'closed'
  const deadline = isValidDate(camp?.discounts?.deadline) ? new Date(camp.discounts.deadline) : null

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">{camp?.camp_code || 'CAMP'}</span>
              <h1 className="text-2xl font-semibold text-mssn-slate">Registration Gate</h1>
              <p className="text-sm text-mssn-slate/70">{camp?.camp_title} — {camp?.camp_date}</p>
            </div>
            <StatusBadge status={status} />
          </div>

          {status === 'upcoming' && startValid && (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Registration opens on <span className="font-semibold">{new Date(camp.registration_start).toLocaleString('en-NG')}</span>.
              <div className="mt-2"><Countdown start={camp.registration_start} /></div>
            </div>
          )}

          {status === 'closed' && (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Registration has ended{endValid ? ` on ${new Date(camp.registration_end).toLocaleString('en-NG')}` : ''}.
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PriceBox label="TFL" price={camp?.prices?.tfl} discounted={camp?.discounts?.price_tfl} quota={camp?.quotas?.tfl} />
            <PriceBox label="Secondary" price={camp?.prices?.secondary} discounted={camp?.discounts?.price_sec} quota={camp?.quotas?.secondary} />
            <PriceBox label="Undergraduate" price={camp?.prices?.undergraduate} discounted={camp?.discounts?.price_und} quota={camp?.quotas?.undergraduate} />
            <PriceBox label="Others" price={camp?.prices?.others} discounted={camp?.discounts?.price_oth} quota={camp?.quotas?.others} />
          </div>

          {deadline && (
            <p className="mt-3 text-xs text-mssn-slate/60">Discount deadline: {deadline.toLocaleDateString('en-NG')}</p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={open ? '#/existing/validate' : undefined}
              aria-disabled={!open}
              className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto ${
                open ? 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white' : 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate'
              }`}
            >
              Existing Member
            </a>
            <a
              href={open ? 'https://mssnlagos.org/camp/register/new' : undefined}
              target={open ? '_blank' : undefined}
              rel={open ? 'noreferrer' : undefined}
              aria-disabled={!open}
              className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto ${
                open ? 'border border-mssn-green/30 text-mssn-greenDark' : 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate'
              }`}
            >
              New Member
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
