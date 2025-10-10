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
    <div className="flex gap-3 text-xs text-mssn-slate/80">
      <div><span className="text-mssn-slate font-semibold">{parts.days}</span> days</div>
      <div><span className="text-mssn-slate font-semibold">{parts.hours}</span> hrs</div>
      <div><span className="text-mssn-slate font-semibold">{parts.minutes}</span> mins</div>
    </div>
  )
}

export default function RegistrationGateCard() {
  const { settings, loading } = useSettings()
  if (loading) return null
  const camp = settings?.current_camp
  if (!camp) return null

  const startValid = isValidDate(camp?.registration_start)
  const endValid = isValidDate(camp?.registration_end)
  const open = isRegistrationOpen(camp)
  const status = open ? 'open' : startValid && new Date() < new Date(camp.registration_start) ? 'upcoming' : 'closed'

  return (
    <section className="relative z-20 mx-auto -mt-6 sm:-mt-12 lg:-mt-16 w-full max-w-6xl px-6" aria-label="Registration gate">
      <div className="overflow-hidden rounded-4xl border border-mssn-slate/10 bg-white/95 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <StatusBadge status={status} />
              <span className="text-xs text-mssn-slate/60">{camp?.camp_title}</span>
            </div>
            {status === 'upcoming' && startValid && (
              <div className="text-sm text-mssn-slate/70">
                Opens on <span className="font-semibold">{new Date(camp.registration_start).toLocaleString('en-NG')}</span>
              </div>
            )}
            {status === 'closed' && (
              <div className="text-sm text-mssn-slate/70">
                Registration has ended{endValid ? ` on ${new Date(camp.registration_end).toLocaleString('en-NG')}` : ''}.
              </div>
            )}
            {status === 'upcoming' && startValid && (
              <div className="mt-1"><Countdown start={camp.registration_start} /></div>
            )}
          </div>
          <div className="mt-4 flex gap-3 sm:mt-0">
            <a
              href={open ? '#/existing/validate' : undefined}
              aria-disabled={!open}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition ${
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
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition ${
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
