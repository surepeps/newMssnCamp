import { useMemo } from 'react'

const quickActions = [
  {
    id: 'new-camper',
    title: 'New camper signup',
    description: 'Create a profile, add guardians, and pay securely online.',
    href: 'https://mssnlagos.org/camp/register/new',
    icon: '🆕',
  },
  {
    id: 'returning',
    title: 'Returning member',
    description: 'Retrieve your MSSN ID, update records, and reserve your bunk.',
    href: 'https://mssnlagos.org/camp/register/returning',
    icon: '🔁',
  },
  {
    id: 'chapter-coach',
    title: 'Chapter coach tools',
    description: 'Upload bulk registrations, monitor slots, and download slips.',
    href: 'https://camp.mssnlagos.net/coaches',
    icon: '📋',
  },
]

const tracks = [
  {
    id: 'faith',
    title: 'Faith & Leadership',
    description: 'Intensive halaqah, tafsir, and servant-leadership workshops to strengthen deen and service.',
    image:
      'https://images.unsplash.com/photo-1583225272834-1ef6f3f2a4b2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'creatives',
    title: 'Creatives & Media',
    description: 'Storytelling, digital media, and design labs with hands-on projects and production sprints.',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'tech',
    title: 'Tech & Innovation',
    description: 'Product, engineering, and no‑code studios focused on real community impact.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
]

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-mssn-night text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80"
          alt="Camp mentorship lab"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-mssn-night/95 via-mssn-night/75 to-mssn-green/40" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">
            Camp MSSN Lagos 2025
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Your journey to faith, skills, and service — all in one camp portal
          </h1>
          <p className="max-w-2xl text-lg text-white/80 lg:text-xl">
            Register, choose a track, and get instant updates. Access resources, schedules, roommates and partner offers — everything you need to enjoy camp week.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://mssnlagos.org/camp/register/new"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-2px]"
            >
              Start registration
            </a>
            <a
              href="#tracks"
              className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Explore tracks
            </a>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { label: 'Registered', value: '12k+' },
            { label: 'Scholarships', value: '350+' },
            { label: 'Chapters', value: '120+' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-white/15 bg-white/10 p-5 text-center backdrop-blur"
            >
              <div className="text-2xl font-semibold">{s.value}</div>
              <div className="text-xs text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function QuickActions() {
  return (
    <section className="relative z-20 mx-auto -mt-16 w-full max-w-6xl px-6" aria-label="Quick actions">
      <div className="rounded-4xl bg-white/95 p-6 shadow-glow ring-1 ring-mssn-slate/10">
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
                <div className="text-2xl">{action.icon}</div>
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

function Tracks() {
  return (
    <section id="tracks" className="mx-auto mt-28 w-full max-w-6xl px-6" aria-labelledby="tracks-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
            Learning tracks
          </span>
          <h2 id="tracks-heading" className="text-3xl font-semibold text-mssn-slate lg:text-4xl">
            Pick a path that grows both faith and skills
          </h2>
          <p className="text-base text-mssn-slate/70">
            Hands‑on studios, mentorship, and project sprints led by facilitators from campuses and industry.
          </p>
        </div>
        <a
          href="https://mssnlagos.org/camp/register/new"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-5 text-sm font-semibold text-white shadow-glow"
        >
          Choose your track
        </a>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tracks.map((t) => (
          <div key={t.id} className="group overflow-hidden rounded-4xl border border-mssn-slate/10 bg-white shadow-soft">
            <div className="relative h-48 w-full overflow-hidden">
              <img src={t.image} alt={t.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-mssn-night/60 via-transparent to-transparent" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-mssn-slate">{t.title}</h3>
              <p className="mt-3 text-sm text-mssn-slate/70">{t.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Steps() {
  const steps = useMemo(
    () => [
      { title: 'Create profile', desc: 'Tell us about you and your chapter.' },
      { title: 'Select a track', desc: 'Pick what fits your goals and interests.' },
      { title: 'Secure your slot', desc: 'Pay and receive confirmation instantly.' },
      { title: 'Arrive at camp', desc: 'Check in, get your welcome kit, and settle in.' },
    ],
    [],
  )

  return (
    <section className="mx-auto mt-28 w-full max-w-6xl px-6" aria-labelledby="how-heading">
      <h2 id="how-heading" className="text-3xl font-semibold text-mssn-slate lg:text-4xl">
        How it works
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-3xl border border-mssn-slate/10 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mssn-green/15 text-mssn-greenDark">
              {i + 1}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-mssn-slate">{s.title}</h3>
            <p className="mt-2 text-sm text-mssn-slate/70">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Testimonials() {
  const quotes = [
    {
      name: 'Aisha – UNILAG',
      quote:
        'The mentorship pods changed how I approach leadership and study. Best camp experience I have had.',
    },
    {
      name: 'Faruk – LASU',
      quote:
        'Loved the balance of ibadah, learning and service. The portal kept me on time for every session.',
    },
    {
      name: 'Maryam – YABATECH',
      quote: 'Our team built a small project for campus and got post‑camp support from mentors.',
    },
  ]

  return (
    <section className="mx-auto mt-28 w-full max-w-6xl px-6" aria-labelledby="testimonials-heading">
      <div className="flex items-end justify-between">
        <h2 id="testimonials-heading" className="text-3xl font-semibold text-mssn-slate lg:text-4xl">
          What campers say
        </h2>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {quotes.map((q) => (
          <figure key={q.name} className="rounded-4xl border border-mssn-slate/10 bg-white p-6 shadow-soft">
            <blockquote className="text-mssn-slate/80">“{q.quote}”</blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-mssn-slate">{q.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function FAQ() {
  const items = [
    {
      q: 'Can I change tracks after registering?',
      a: 'Yes, you can switch before camp check‑in. Log in to your portal and update your selection.',
    },
    {
      q: 'Are there scholarships?',
      a: 'Yes. Watch the sponsors section for scholarship slots and apply early for consideration.',
    },
    {
      q: 'Do I need to print anything?',
      a: 'No printing required. Your digital pass and schedule are available on the portal.',
    },
  ]

  return (
    <section id="faq" className="mx-auto mt-28 w-full max-w-6xl px-6" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-3xl font-semibold text-mssn-slate lg:text-4xl">
        Frequently asked questions
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((it) => (
          <details key={it.q} className="group rounded-3xl border border-mssn-slate/10 bg-white p-5 open:shadow-soft">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-mssn-slate">
              <span className="text-base font-semibold">{it.q}</span>
              <span className="rounded-full border border-mssn-slate/20 px-2 py-0.5 text-xs text-mssn-slate/70 group-open:hidden">Show</span>
              <span className="hidden rounded-full border border-mssn-slate/20 px-2 py-0.5 text-xs text-mssn-slate/70 group-open:inline">Hide</span>
            </summary>
            <p className="mt-3 text-sm text-mssn-slate/70">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="relative mx-auto mt-28 w-full max-w-6xl overflow-hidden rounded-4xl px-6">
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="relative z-10 flex flex-col items-start gap-6 rounded-4xl border border-mssn-green/30 bg-white/70 p-8 shadow-glow backdrop-blur">
        <h2 className="text-2xl font-semibold text-mssn-slate sm:text-3xl">
          Ready for Camp MSSN Lagos 2025?
        </h2>
        <p className="max-w-3xl text-mssn-slate/70">
          Join thousands of students building faith, skills, and lifelong friendships. Registration takes less than 5 minutes.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://mssnlagos.org/camp/register/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-6 py-3 text-sm font-semibold text-white shadow-glow"
          >
            Register now
          </a>
          <a
            href="#faq"
            className="inline-flex items-center justify-center rounded-full border border-mssn-slate/20 px-6 py-3 text-sm font-semibold text-mssn-slate hover:bg-mssn-mist"
          >
            Read FAQs
          </a>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div>
      <Hero />
      <QuickActions />
      <Tracks />
      <Steps />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </div>
  )
}
