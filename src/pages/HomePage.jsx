import { useEffect, useState } from 'react'
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

const adPromos = [
  {
    id: 'halal-finance',
    title: 'Halal Bank Scholarships',
    description: 'Secure partial or full sponsorship for leadership and tech tracks when you apply before 30 April.',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80',
    href: 'https://example.com/halal-bank',
  },
  {
    id: 'nutrition',
    title: 'Nourish Foods Meal Plan',
    description: 'Balanced meal kits and hydration stations set up across camp with vegan and allergy-friendly options.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    href: 'https://example.com/nourish-foods',
  },
  {
    id: 'technaija',
    title: 'TechNaija STEM Studio',
    description: 'Hands-on innovation lab with devices, mentors, and post-camp incubation support for standout teams.',
    image:
      'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=900&q=80',
    href: 'https://example.com/technaija',
  },
]

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
