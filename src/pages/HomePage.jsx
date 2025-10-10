import { useEffect, useState } from 'react'
import { useMemo, useState } from 'react'
import { navigate, isModifiedEvent } from '../utils/navigation.js'
import { useSettings } from '../context/SettingsContext.jsx'
import PricingDiscounts from '../components/PricingDiscounts.jsx'

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
    ctaLabel: 'See partner offers',
    ctaHref: '#ads',
  },
  {
    id: 'service-day',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
    title: 'Service day rallies that transform communities together.',
    description:
      'Volunteer squads roll out outreach and tech clinics powered by coordinated logistics.',
    ctaLabel: 'View offers',
    ctaHref: '#ads',
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
  return (
    <section id="ads" className="mx-auto mt-28 w-full max-w-6xl px-6" aria-labelledby="ads-heading">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
            Sponsored experiences
          </span>
          <h2 id="ads-heading" className="text-3xl font-semibold text-mssn-slate lg:text-4xl">
            Partners powering scholarships, meals, and innovation labs
          </h2>
          <p className="text-base text-mssn-slate/70">
            Discover exclusive offers from our partners before camp kicks off. Apply early to secure discounts, premium services, and gear upgrades.
          </p>
        </div>
        <div className="text-sm text-mssn-slate/60">
          Updated weekly as new sponsorships roll in. Log in to the portal to claim offers matched to your track.
        </div>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {adPromos.map((promo) => (
          <a
            key={promo.id}
            href={promo.href}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-4xl border border-mssn-slate/10 bg-white/95 transition hover:-translate-y-1 hover:border-mssn-green/40"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={promo.image}
                alt={promo.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mssn-night/60 via-transparent to-transparent" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-mssn-slate">{promo.title}</h3>
              <p className="mt-3 text-sm text-mssn-slate/70">{promo.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-mssn-greenDark">
                Learn more
                <span aria-hidden="true">↗</span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div>
      <HeroSlider />
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="-mt-10 lg:-mt-14">
          <QuickActionsBar />
        </div>
      </div>
      <PricingDiscounts />
      <AdsSection />
    </div>
  )
}
