import { useEffect, useState } from 'react'
import { useMemo } from 'react'
import { navigate, isModifiedEvent } from '../utils/navigation.js'
import { useSettings } from '../context/SettingsContext.jsx'
import PricingDiscounts from '../components/PricingDiscounts.jsx'

const DRAFT_KEY = 'new_member_draft'

const slides = [
  {
    id: 'digital-onboarding',
    image:
      'https://images.unsplash.com/photo-1486506574466-9ef0ef9c0968?auto=format&fit=crop&w=1600&q=80',
    title: 'Digital onboarding built for every MSSN Lagos camper.',
    description:
      'Register in minutes and receive reminders that keep you ready for the Faith, Leadership & Service retreat.',
    ctaLabel: 'Start registration',
    ctaHref: 'https://mssnlagos.org/camp/register/new',
  },
  {
    id: 'mentorship-hub',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    title: 'Mentorship labs that connect scholars, creatives, and civic leaders.',
    description:
      'Choose learning pods, access resource kits, and collaborate on impact projects that stretch beyond camp week.',
    ctaLabel: 'Quick actions',
    ctaHref: '#quick-actions',
  },
  {
    id: 'service-day',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
    title: 'Service day rallies that transform communities together.',
    description:
      'Volunteer squads roll out outreach and tech clinics powered by coordinated logistics.',
    ctaLabel: 'Quick actions',
    ctaHref: '#quick-actions',
  },
]

const quickActions = [
  {
    id: 'new-member',
    title: 'New Member',
    description: 'Create your profile and pay securely online.',
    href: '/new',
  },
  {
    id: 'existing-member',
    title: 'Existing Member',
    description: 'Retrieve MSSN ID, update records, reserve your bunk.',
    href: '/existing/validate',
  },
  {
    id: 'reprint-slip',
    title: 'Reprint-slip',
    description: 'Reprint your registration slip anytime.',
    href: 'https://mssnlagos.org/camp/register/reprint',
  },
]

const adSlots = [
  {
    id: 'hero-takeover',
    name: 'Hero Slider Takeover',
    type: 'Premium hero placement',
    status: 'reserved',
    summary: 'Full-width hero creative displayed on the onboarding hero with deep link CTA.',
    metrics: [
      { label: 'Weekly impressions', value: '18k visits' },
      { label: 'CTR benchmark', value: '4.1%' },
    ],
    nextWindow: 'Next opening: 15 Jun – 12 Jul',
    investment: '₦180k per week',
    sponsor: 'Halal Bank Scholarships',
  },
  {
    id: 'confirmation-modal',
    name: 'Registration Confirmation Modal',
    type: 'Lifecycle placement',
    status: 'available',
    summary: 'Appears immediately after a camper completes registration with a call-to-action button.',
    metrics: [
      { label: 'View-through rate', value: '92%' },
      { label: 'Avg. leads', value: '120 per week' },
    ],
    nextWindow: 'Instant activation • 2-week minimum',
    investment: '₦140k per 14 days',
  },
  {
    id: 'daily-brief',
    name: 'Daily Brief Email Banner',
    type: 'Email placement',
    status: 'available',
    summary: 'Featured banner inside the nightly recap email sent to campers, alumni and guardians.',
    metrics: [
      { label: 'Open rate', value: '46%' },
      { label: 'Audience size', value: '6.8k subscribers' },
    ],
    nextWindow: 'Reserve for upcoming camp week',
    investment: '₦75k per send',
  },
  {
    id: 'mobile-footer',
    name: 'Mobile Footer Spotlight',
    type: 'Always-on placement',
    status: 'waitlist',
    summary: 'Fixed footer placement on mobile that stays visible as users navigate registration screens.',
    metrics: [
      { label: 'Views per session', value: '3.4' },
      { label: 'Mobile share', value: '82%' },
    ],
    nextWindow: 'Next opening: 01 Aug',
    investment: '₦95k per week',
  },
]

const placementInsights = [
  {
    label: 'Daily sessions',
    value: '11.4k',
    description: 'Across prospective, current and returning campers.',
  },
  {
    label: 'Returning visitors',
    value: '68%',
    description: 'Members who revisit the portal within 7 days.',
  },
  {
    label: 'Avg. session length',
    value: '06:12',
    description: 'Time spent navigating the onboarding journey.',
  },
]

const requestGuidelines = [
  'Share your preferred go-live date and the creative format you intend to ship.',
  'Attach clear campaign objectives so we can recommend the best placement mix.',
  'Our partnerships desk replies within 2 business days with timelines and specs.',
]

const SLOT_STATUS_META = {
  available: {
    label: 'Available now',
    badgeClass: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
  },
  reserved: {
    label: 'Reserved',
    badgeClass: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  },
  waitlist: {
    label: 'Join waitlist',
    badgeClass: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  },
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function createInitialRequestValues() {
  return {
    fullName: '',
    organization: '',
    email: '',
    slot: '',
    objectives: '',
  }
}

function SlideControls({ activeIndex, onSelect }) {
  return (
    <div className="flex items-center gap-3">
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          type="button"
          onClick={() => onSelect(index)}
          className={`h-2 w-10 rounded-full transition ${index === activeIndex ? 'bg-white' : 'bg-white/40'}`}
          aria-label={`Show slide ${index + 1}`}
          aria-pressed={index === activeIndex}
        />
      ))}
    </div>
  )
}

function HeroSlider() {
  const { settings } = useSettings()
  const camp = settings?.current_camp
  const campTitle = camp?.camp_title || 'Camp MSSN Lagos'
  const bgImage = 'https://images.unsplash.com/photo-1486506574466-9ef0ef9c0968?auto=format&fit=crop&w=1600&q=80'

  return (
    <section id="home" className="relative overflow-hidden bg-mssn-night text-white">
      <div className="absolute inset-0">
        <img src={bgImage} alt={campTitle} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-mssn-night/95 via-mssn-night/75 to-mssn-green/50" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-24">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">
          {camp?.camp_code || 'CAMP'}
        </span>
        <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">{campTitle}</h1>
        {camp?.camp_theme && (
          <p className="max-w-2xl text-lg text-white/90 lg:text-xl">{camp.camp_theme}</p>
        )}
        {camp?.camp_date && (
          <p className="text-sm text-white/80">{camp.camp_date}</p>
        )}
      </div>
    </section>
  )
}

function ResumeRegistrationBanner() {
  const [draft, setDraft] = useState(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) setDraft(JSON.parse(raw))
    } catch {}
  }, [])
  const resumeCategory = draft?.category
  if (!resumeCategory) return null
  const resumeName = draft?.values?.surname || draft?.values?.firstname ? `${draft?.values?.surname ?? ''} ${draft?.values?.firstname ?? ''}`.trim() : null
  return (
    <section className="relative z-20 mx-auto -mt-14 w-full max-w-6xl px-6" aria-label="Resume registration">
      <div className="rounded-4xl border border-mssn-green/30 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-mssn-slate">You have a pending new registration</p>
            <p className="text-xs text-mssn-slate/60">{resumeName ? `${resumeName} • ` : ''}{String(resumeCategory).charAt(0).toUpperCase() + String(resumeCategory).slice(1)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate(`/new/${resumeCategory}`)} className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white">
              Continue
            </button>
            <button type="button" onClick={() => { try { localStorage.removeItem(DRAFT_KEY) } catch {} setDraft(null) }} className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700">
              Delete
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function QuickActionsBar() {
  const handleActionClick = (href) => (event) => {
    if (href.startsWith('http')) {
      return
    }
    if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) {
      return
    }
    event.preventDefault()
    navigate(href)
  }

  return (
    <section
      id="quick-actions"
      className="relative z-20 mx-auto mt-6 w-full max-w-6xl px-6"
      aria-label="Quick actions"
    >
      <div className="rounded-4xl bg-white/95 p-6 ring-1 ring-mssn-slate/10">
        <div className="grid gap-6 lg:grid-cols-3">
          {quickActions.map((action) => (
            <a
              key={action.id}
              href={action.href}
              target={action.href.startsWith('http') ? '_blank' : undefined}
              rel={action.href.startsWith('http') ? 'noreferrer' : undefined}
              onClick={handleActionClick(action.href)}
              className="group flex h-full flex-col justify-between rounded-3xl border border-mssn-slate/10 bg-mssn-mist p-6 transition hover:-translate-y-1 hover:border-mssn-green/40"
            >
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-mssn-slate">{action.title}</h2>
                <p className="text-sm text-mssn-slate/70">{action.description}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-mssn-greenDark">
                Continue
                <span aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function AdsSection() {
  const [formValues, setFormValues] = useState(() => createInitialRequestValues())
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionState, setSubmissionState] = useState({ status: 'idle', message: '' })

  const requestOptions = useMemo(
    () => adSlots.map((slot) => ({ value: slot.id, label: slot.name, status: slot.status })),
    []
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validate = (values) => {
    const nextErrors = {}
    if (!values.fullName.trim()) nextErrors.fullName = 'Enter your full name'
    if (!values.organization.trim()) nextErrors.organization = 'Enter your organisation'
    if (!values.email.trim()) nextErrors.email = 'Enter a valid email'
    else if (!emailPattern.test(values.email.trim())) nextErrors.email = 'Enter a valid email'
    if (!values.slot.trim()) nextErrors.slot = 'Select a preferred slot'
    if (!values.objectives.trim()) nextErrors.objectives = 'Share your campaign objectives'
    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmissionState({ status: 'idle', message: '' })
    setIsSubmitting(true)
    const validationErrors = validate(formValues)
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      setSubmissionState({ status: 'error', message: 'Please fix the highlighted fields.' })
      setIsSubmitting(false)
      return
    }
    setErrors({})
    setSubmissionState({
      status: 'success',
      message: 'Request received. Our partnerships team will be in touch within 2 business days.',
    })
    setFormValues(createInitialRequestValues())
    setIsSubmitting(false)
  }

  const handleSlotSelection = (slotId) => {
    setFormValues((prev) => ({ ...prev, slot: slotId }))
    setErrors((prev) => {
      if (!prev.slot) return prev
      const next = { ...prev }
      delete next.slot
      return next
    })
    setSubmissionState({ status: 'idle', message: '' })
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const requestCard = document.getElementById('ad-slot-request')
        requestCard?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  return (
    <section id="ads" className="mx-auto mt-28 w-full max-w-6xl px-6" aria-labelledby="ads-heading">
      <div className="overflow-hidden rounded-4xl border border-mssn-slate/10 bg-white/95 shadow-soft">
        <div className="grid gap-10 p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:p-12">
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
                Sponsored experiences
              </span>
              <h2 id="ads-heading" className="text-3xl font-semibold text-mssn-slate lg:text-4xl">
                Ad slot inventory & request desk
              </h2>
              <p className="text-base text-mssn-slate/70">
                Promote programmes, scholarships or services to verified campers with placements designed for visibility and trust.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2" role="list">
              {adSlots.map((slot) => {
                const statusMeta = SLOT_STATUS_META[slot.status] || SLOT_STATUS_META.available
                const buttonLabel =
                  slot.status === 'available'
                    ? 'Request this slot'
                    : slot.status === 'waitlist'
                      ? 'Join waitlist'
                      : 'Currently booked'
                const buttonStateClasses =
                  slot.status === 'available'
                    ? 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white hover:from-mssn-greenDark hover:to-mssn-greenDark'
                    : slot.status === 'waitlist'
                      ? 'border border-amber-400/60 text-amber-700 hover:bg-amber-50'
                      : 'border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60 cursor-not-allowed'
                const isDisabled = slot.status === 'reserved'
                return (
                  <article
                    key={slot.id}
                    role="listitem"
                    className="flex h-full flex-col rounded-3xl border border-mssn-slate/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-mssn-green/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-mssn-slate">{slot.name}</h3>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">
                          {slot.type}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-semibold ${statusMeta.badgeClass}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-mssn-slate/70">{slot.summary}</p>
                    <dl className="mt-5 grid gap-2">
                      {slot.metrics.map((metric) => (
                        <div
                          key={`${slot.id}-${metric.label}`}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-mssn-mist/60 px-3 py-2"
                        >
                          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">
                            {metric.label}
                          </dt>
                          <dd className="text-sm font-semibold text-mssn-slate">{metric.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4 space-y-1 text-xs text-mssn-slate/60">
                      <p>{slot.nextWindow}</p>
                      <p className="font-semibold text-mssn-slate/70">{slot.investment}</p>
                      {slot.sponsor ? <p>Currently running: {slot.sponsor}</p> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => !isDisabled && handleSlotSelection(slot.id)}
                      disabled={isDisabled}
                      className={`mt-5 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-mssn-green/30 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${buttonStateClasses}`}
                    >
                      {buttonLabel}
                    </button>
                  </article>
                )
              })}
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-mssn-slate/10 bg-mssn-mist/60 p-6">
              <h3 className="text-sm font-semibold text-mssn-slate">Inventory snapshot</h3>
              <dl className="mt-5 grid gap-4">
                {placementInsights.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/70 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-mssn-green">{item.label}</dt>
                    <dd className="mt-1 text-lg font-semibold text-mssn-slate">{item.value}</dd>
                    <p className="mt-1 text-xs text-mssn-slate/60">{item.description}</p>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-3xl border border-mssn-slate/10 bg-white p-6">
              <h3 className="text-sm font-semibold text-mssn-slate">Before you submit</h3>
              <ul className="mt-4 space-y-3 text-sm text-mssn-slate/70">
                {requestGuidelines.map((tip, index) => (
                  <li key={tip} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-mssn-green/15 text-[0.65rem] font-semibold text-mssn-greenDark">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              id="ad-slot-request"
              tabIndex="-1"
              className="rounded-3xl border border-mssn-green/20 bg-white/95 p-6 shadow-glow outline-none focus:ring-2 focus:ring-mssn-green/30"
            >
              <h3 className="text-base font-semibold text-mssn-slate">Request an ad slot</h3>
              <p className="mt-2 text-sm text-mssn-slate/70">
                Tell us about your campaign and we will share specs, timelines, and tracking setup.
              </p>
              {submissionState.status !== 'idle' ? (
                <div
                  className={`mt-4 rounded-2xl border px-3 py-2 text-xs font-medium ${
                    submissionState.status === 'success'
                      ? 'border-mssn-green/30 bg-mssn-green/10 text-mssn-greenDark'
                      : 'border-rose-200 bg-rose-50 text-rose-600'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {submissionState.message}
                </div>
              ) : null}
              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="ad-request-fullName" className="text-xs font-semibold uppercase tracking-[0.22em] text-mssn-slate/70">
                    Full name*
                  </label>
                  <input
                    id="ad-request-fullName"
                    name="fullName"
                    value={formValues.fullName}
                    onChange={handleChange}
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mssn-green/25 ${
                      errors.fullName ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20'
                    }`}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                  {errors.fullName ? <p className="mt-1 text-xs font-medium text-rose-500">{errors.fullName}</p> : null}
                </div>
                <div>
                  <label htmlFor="ad-request-organization" className="text-xs font-semibold uppercase tracking-[0.22em] text-mssn-slate/70">
                    Organisation*
                  </label>
                  <input
                    id="ad-request-organization"
                    name="organization"
                    value={formValues.organization}
                    onChange={handleChange}
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mssn-green/25 ${
                      errors.organization ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20'
                    }`}
                    placeholder="What organisation are you representing?"
                    autoComplete="organization"
                  />
                  {errors.organization ? <p className="mt-1 text-xs font-medium text-rose-500">{errors.organization}</p> : null}
                </div>
                <div>
                  <label htmlFor="ad-request-email" className="text-xs font-semibold uppercase tracking-[0.22em] text-mssn-slate/70">
                    Work email*
                  </label>
                  <input
                    id="ad-request-email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleChange}
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mssn-green/25 ${
                      errors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20'
                    }`}
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                  {errors.email ? <p className="mt-1 text-xs font-medium text-rose-500">{errors.email}</p> : null}
                </div>
                <div>
                  <label htmlFor="ad-request-slot" className="text-xs font-semibold uppercase tracking-[0.22em] text-mssn-slate/70">
                    Preferred slot*
                  </label>
                  <select
                    id="ad-request-slot"
                    name="slot"
                    value={formValues.slot}
                    onChange={handleChange}
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mssn-green/25 ${
                      errors.slot ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20'
                    }`}
                  >
                    <option value="">Select a placement...</option>
                    {requestOptions.map((option) => {
                      const statusMeta = SLOT_STATUS_META[option.status] || SLOT_STATUS_META.available
                      return (
                        <option key={option.value} value={option.value}>
                          {option.label} ({statusMeta.label.toLowerCase()})
                        </option>
                      )
                    })}
                    <option value="custom-brief">I need help choosing</option>
                  </select>
                  {errors.slot ? <p className="mt-1 text-xs font-medium text-rose-500">{errors.slot}</p> : null}
                </div>
                <div>
                  <label htmlFor="ad-request-objectives" className="text-xs font-semibold uppercase tracking-[0.22em] text-mssn-slate/70">
                    Campaign objectives*
                  </label>
                  <textarea
                    id="ad-request-objectives"
                    name="objectives"
                    rows="3"
                    value={formValues.objectives}
                    onChange={handleChange}
                    className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-mssn-green/25 ${
                      errors.objectives ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20'
                    }`}
                    placeholder="Share key outcomes, KPIs, or offers."
                  />
                  {errors.objectives ? <p className="mt-1 text-xs font-medium text-rose-500">{errors.objectives}</p> : null}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-mssn-green/30 ${
                    isSubmitting
                      ? 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60'
                      : 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white hover:from-mssn-greenDark hover:to-mssn-greenDark'
                  }`}
                >
                  {isSubmitting ? 'Sending…' : 'Submit request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div>
      <HeroSlider />
      <div className="mx-auto w-full max-w-6xl px-6">
        <ResumeRegistrationBanner />
        <div className="-mt-10 lg:-mt-14">
          <QuickActionsBar />
        </div>
      </div>
      <PricingDiscounts />
    </div>
  )
}
