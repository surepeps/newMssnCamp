import { useEffect, useMemo, useState } from 'react'

const logoUrl = 'https://camp.mssnlagos.net/assets/thumbnail_large.png'

const navigationLinks = [
  { id: 'overview', label: 'Overview', href: '#overview' },
  { id: 'journey', label: 'Journey', href: '#journey' },
  { id: 'tracks', label: 'Tracks', href: '#tracks' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'support', label: 'Support', href: '#support' },
  { id: 'partners', label: 'Partners', href: '#partners' },
  { id: 'faq', label: 'FAQs', href: '#faq' },
]

const heroStories = [
  {
    id: 'arrival-day',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    badge: 'Camp 2025 Highlight',
    title: 'The annual retreat where faith, leadership, and innovation intersect.',
    description:
      'Reimagine onboarding, mentorship, and service with a digital-first experience crafted for Muslim youths across Lagos.',
    quote:
      '“I arrived unsure and left with mentors, a tech project, and a deeper connection to my deen.” — Mariam, 21',
    stats: [
      { id: 'facilitators', label: 'Expert facilitators', value: '130' },
      { id: 'chapters', label: 'Local chapters', value: '45' },
    ],
  },
  {
    id: 'mentorship',
    image:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80',
    badge: 'Mentorship Lab',
    title: 'Hands-on clinics with scholars, civic leaders, and industry mentors.',
    description:
      'Each camper joins a focus pod for guided mentorship, career coaching, and spiritual development tailored to their goals.',
    quote:
      '“The coaching sessions felt like a masterclass built just for me.” — AbdulRahman, facilitator',
    stats: [
      { id: 'pods', label: 'Mentorship pods', value: '28' },
      { id: 'hours', label: 'Learning hours', value: '60+' },
    ],
  },
  {
    id: 'service-day',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
    badge: 'Community Impact',
    title: 'Service day that empowers neighborhoods and reinforces unity.',
    description:
      'From medical outreach to youth tech clubs, teams execute projects that keep MSSN Lagos rooted in service.',
    quote:
      '“Seeing our work uplift the community made every training session worth it.” — Aminat, volunteer lead',
    stats: [
      { id: 'projects', label: 'Impact projects', value: '18' },
      { id: 'volunteers', label: 'Active volunteers', value: '900+' },
    ],
  },
]

const coreStats = [
  { id: 'participants', label: 'Expected participants', value: '3,500+' },
  { id: 'scholarships', label: 'Scholarships available', value: '320' },
  { id: 'program-days', label: 'Immersive days', value: '7' },
  { id: 'digital-checkins', label: 'Digital check-ins completed', value: '12k+' },
]

const milestoneTimeline = [
  {
    id: 'step-intent',
    title: 'Declare intent',
    description:
      'Choose your track, submit personal details, and signal any accommodation needs—our system adapts instantly.',
    icon: '📝',
  },
  {
    id: 'step-verify',
    title: 'Verify & secure your slot',
    description:
      'Upload identification, receive SMS confirmation, and lock in your preferred lodging before the deadline.',
    icon: '✅',
  },
  {
    id: 'step-immerse',
    title: 'Immerse & serve',
    description:
      'Join orientation webinars, pick volunteer roles, and arrive ready for a week of worship, learning, and impact.',
    icon: '🌙',
  },
]

const focusTracks = [
  {
    id: 'leadership',
    title: 'Leadership & governance',
    description:
      'Sharpen decision-making, strategic planning, and civic engagement with case studies from alumni leading today.',
    outcomes: ['Policy labs with civic mentors', 'Scenario-based leadership simulations', 'Peer feedback circles'],
  },
  {
    id: 'technology',
    title: 'Technology & innovation',
    description:
      'Build digital literacy, launch community apps, and explore ethical technology for Muslim communities.',
    outcomes: ['Product design sprints', 'Intro to AI safety workshops', 'Access to post-camp accelerator'],
  },
  {
    id: 'wellbeing',
    title: 'Well-being & resilience',
    description:
      'Strengthen spiritual routines, emotional resilience, and personal wellness with guidance from scholars and therapists.',
    outcomes: ['Guided tafsir reflections', 'Breathwork and journaling labs', 'Nutrition and fitness coaching'],
  },
]

const experienceHighlights = [
  {
    id: 'night-vigils',
    title: 'Night vigils under the stars',
    description:
      'Qiyam sessions led by seasoned scholars with translations, reflections, and nasheed interludes.',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'innovation-lab',
    title: 'Innovation lab showcases',
    description:
      'Teams pitch solutions that tackle education access, environmental justice, and economic inclusion.',
    image:
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'service-rally',
    title: 'Service rally and outreach',
    description:
      'Mobile clinics, school painting, and literacy drives powered by coordinated volunteer squads.',
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
  },
]

const dailyRhythms = [
  {
    id: 'dawn-circle',
    time: '05:00',
    title: 'Dawn reflections',
    details: 'Collective tahajjud, adhkar, and personal journaling moments before sunrise.',
  },
  {
    id: 'learning-blocks',
    time: '10:00',
    title: 'Learning blocks',
    details: 'Breakout sessions across the leadership, technology, and well-being tracks.',
  },
  {
    id: 'networking-hub',
    time: '14:30',
    title: 'Networking hub',
    details: 'Mentor meetups, sponsor lounges, and career advisory clinics with industry experts.',
  },
  {
    id: 'service-waves',
    time: '16:00',
    title: 'Service waves',
    details: 'Teams deploy to field projects, from agritech demos to community outreach.',
  },
  {
    id: 'night-forum',
    time: '20:30',
    title: 'Night forum',
    details: 'Panel discussions, reflections, and talent showcases closing out the day.',
  },
]

const supportChannels = [
  {
    id: 'support-new',
    title: 'First-time camper concierge',
    description:
      'Guided onboarding calls, medical documentation support, and accommodation pairing for new attendees.',
    href: 'https://mssnlagos.org/camp/register/new',
    action: 'Start onboarding',
  },
  {
    id: 'support-returning',
    title: 'Returning member fast-track',
    description:
      'Restore previous data, reserve bunkmates, and sync your profile with your chapter in minutes.',
    href: 'https://mssnlagos.org/camp/register/returning',
    action: 'Secure your slot',
  },
  {
    id: 'support-sponsors',
    title: 'Partner activation desk',
    description:
      'Co-create scholarships, sponsor experiences, and design on-ground activations with our media team.',
    href: 'mailto:partners@mssnlagos.org',
    action: 'Email partnership team',
  },
]

const resourceLinks = [
  {
    id: 'packing',
    title: 'Packing & travel guide',
    description: 'Download the 2025 checklist with dress code, tech requirements, and transport tips.',
    href: 'https://camp.mssnlagos.net/resources/packing-guide.pdf',
  },
  {
    id: 'medical',
    title: 'Medical clearance form',
    description: 'Ensure your records are updated for onsite clinics and dietary planning.',
    href: 'https://camp.mssnlagos.net/resources/medical-clearance.pdf',
  },
  {
    id: 'mentors',
    title: 'Mentor faculty roster',
    description: 'Meet the scholars, coaches, and professionals anchoring each track.',
    href: 'https://camp.mssnlagos.net/resources/mentor-roster.pdf',
  },
]

const partnerShowcase = [
  {
    id: 'halal-bank',
    name: 'Halal Bank Nigeria',
    message: 'Empowering ethical finance clinics and funding scholarships for emerging leaders.',
    link: 'https://example.com/halal-bank',
  },
  {
    id: 'nourish-foods',
    name: 'Nourish Foods',
    message: 'Serving clean meals, hydration stations, and nutrition workshops for all attendees.',
    link: 'https://example.com/nourish-foods',
  },
  {
    id: 'technaija',
    name: 'TechNaija STEM',
    message: 'Driving the innovation lab with devices, mentors, and post-camp incubation pathways.',
    link: 'https://example.com/technaija',
  },
]

const faqItems = [
  {
    id: 'fees',
    question: 'What fees should I budget for the camp?',
    answer:
      'Registration covers accommodation, meals, workshops, and camp resources. Optional add-ons include inter-state transport and select masterclasses. Scholarships are available for qualified applicants.',
  },
  {
    id: 'devices',
    question: 'Do I need to bring devices or laptops?',
    answer:
      'We advise bringing a laptop or tablet for the technology track. Secure lockers and charging stations are provided. Loaner devices are limited—request one during registration if needed.',
  },
  {
    id: 'safety',
    question: 'How does MSSN Lagos handle safety and wellness?',
    answer:
      'Licensed medical professionals, safeguarding officers, and gender-specific accommodation leads are on duty 24/7. Attendees log wellness updates through the portal for rapid response.',
  },
  {
    id: 'chapters',
    question: 'Can chapters register as a group?',
    answer:
      'Yes. Coordinators can upload bulk data, manage payments, and track rooming combinations directly from the dashboard. Group discounts unlock at 20 participants.',
  },
]

function Header({ links, isNavOpen, onToggleNav, onCloseNav }) {
  return (
    <header className="sticky top-0 z-40 border-b border-mssn-slate/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <a
          href="#overview"
          className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-mssn-slate shadow-soft ring-1 ring-mssn-green/20 transition hover:bg-white"
          onClick={onCloseNav}
        >
          <img src={logoUrl} alt="MSSN Lagos camp logo" className="h-12 w-12 rounded-3xl object-cover shadow-soft ring-1 ring-white/40" />
          <span className="flex flex-col text-left">
            <span className="text-xs uppercase tracking-[0.18em] text-mssn-greenDark">MSSN Lagos</span>
            <span className="text-base">Camp Experience 2025</span>
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex">
          {links.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={onCloseNav}
              className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#cta"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-2px]"
          >
            Register now
            <span aria-hidden="true">→</span>
          </a>
        </nav>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-mssn-slate/10 bg-white text-mssn-slate transition hover:border-mssn-green/40 hover:text-mssn-greenDark lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isNavOpen}
          onClick={onToggleNav}
        >
          <span className="text-lg">☰</span>
        </button>
      </div>
      <nav
        className={`lg:hidden transition-all duration-300 ${
          isNavOpen ? 'max-h-[640px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 pb-6">
          {links.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={onCloseNav}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-mssn-slate shadow-sm ring-1 ring-mssn-slate/10"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#cta"
            onClick={onCloseNav}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-mssn-green to-mssn-greenDark px-5 py-3 text-sm font-semibold text-white shadow-glow"
          >
            Register now
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </nav>
    </header>
  )
}

function HeroSection({ stories }) {
  const [activeStory, setActiveStory] = useState(0)
  const story = stories[activeStory]

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStory((prev) => (prev + 1) % stories.length)
    }, 8000)

    return () => window.clearInterval(interval)
  }, [stories.length])

  return (
    <section id="overview" className="relative overflow-hidden bg-mssn-night text-white">
      <div className="absolute inset-0">
        <img src={story.image} alt={story.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-mssn-night/95 via-mssn-night/80 to-mssn-green/60" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">
            {story.badge}
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{story.title}</h1>
          <p className="max-w-2xl text-lg text-white/80 lg:text-xl">{story.description}</p>
          <blockquote className="rounded-3xl border border-white/15 bg-white/5 p-5 text-sm text-white/75 backdrop-blur">
            {story.quote}
          </blockquote>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://mssnlagos.org/camp/register/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-2px]"
            >
              Begin registration
            </a>
            <a
              href="#journey"
              className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Preview the journey
            </a>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6">
          <div className="rounded-4xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Camp by the numbers</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {story.stats.map((stat) => (
                <div key={stat.id} className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/75">
                  <span className="text-2xl font-semibold text-white">{stat.value}</span>
                  <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {stories.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveStory(index)}
                className={`h-2 w-10 rounded-full transition ${index === activeStory ? 'bg-white' : 'bg-white/40'}`}
                aria-label={`View story ${index + 1}`}
                aria-pressed={index === activeStory}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="relative z-10 mx-auto mb-[-5rem] w-full max-w-6xl px-6">
        <div className="grid gap-4 lg:grid-cols-4">
          {coreStats.map((stat) => (
            <article
              key={stat.id}
              className="rounded-3xl border border-white/10 bg-white/15 p-4 text-sm text-white/80 backdrop-blur transition hover:border-white/30 hover:text-white"
            >
              <span className="text-2xl font-semibold text-white">{stat.value}</span>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/70">{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function JourneySection({ milestones }) {
  return (
    <section id="journey" className="mx-auto mt-32 w-full max-w-6xl px-6">
      <div className="rounded-4xl bg-white/90 p-10 shadow-soft ring-1 ring-mssn-slate/10">
        <div className="mx-auto flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
              Journey
            </span>
            <h2 className="text-3xl font-semibold text-mssn-slate lg:text-4xl">From sign-up to impact week</h2>
            <p className="text-base text-mssn-slate/70">
              Everything is orchestrated in the portal—submit documents, receive nudges, and arrive at camp already connected to your pod.
            </p>
          </div>
          <div className="grid flex-1 gap-6 sm:grid-cols-3">
            {milestones.map((milestone) => (
              <article
                key={milestone.id}
                className="rounded-4xl border border-mssn-slate/10 bg-mssn-mist p-6 text-sm text-mssn-slate/80"
              >
                <span className="text-2xl">{milestone.icon}</span>
                <h3 className="mt-4 text-xl font-semibold text-mssn-slate">{milestone.title}</h3>
                <p className="mt-3 text-sm text-mssn-slate/70">{milestone.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TracksSection({ tracks }) {
  return (
    <section id="tracks" className="mx-auto mt-24 w-full max-w-6xl px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
            Focus tracks
          </span>
          <h2 className="text-3xl font-semibold text-mssn-slate lg:text-4xl">Choose the journey that amplifies your purpose</h2>
          <p className="text-base text-mssn-slate/70">
            Each track is curated with facilitators, toolkits, and post-camp accountability partners so you keep growing beyond the week-long retreat.
          </p>
        </div>
        <div className="grid gap-6">
          {tracks.map((track) => (
            <article key={track.id} className="rounded-4xl border border-mssn-slate/10 bg-white/95 p-6 shadow-soft">
              <h3 className="text-xl font-semibold text-mssn-slate">{track.title}</h3>
              <p className="mt-3 text-sm text-mssn-slate/70">{track.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-mssn-slate/70">
                {track.outcomes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-mssn-green" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ExperienceSection({ highlights }) {
  return (
    <section id="experience" className="mt-24 bg-gradient-to-br from-mssn-green/12 via-white to-mssn-green/10">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
            Experience
          </span>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Moments that define Camp MSSN Lagos</h2>
          <p className="mt-4 text-base text-mssn-slate/70">
            Every day blends worship, discovery, and community in spaces designed by and for young Muslims.
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-4xl border border-mssn-slate/15 bg-white/95 shadow-soft">
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mssn-night/70 via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-mssn-slate">{item.title}</h3>
                <p className="mt-3 text-sm text-mssn-slate/70">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function DailyRhythmSection({ rhythms }) {
  return (
    <section className="mx-auto mt-24 w-full max-w-6xl px-6">
      <div className="rounded-4xl bg-white/95 p-10 shadow-soft ring-1 ring-mssn-slate/10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
              Daily rhythm
            </span>
            <h2 className="text-3xl font-semibold text-mssn-slate lg:text-4xl">A cadence that balances worship, learning, and rest</h2>
            <p className="text-base text-mssn-slate/70">
              Navigate the week with clarity. Each block is synchronized inside the portal—complete with reminders, room assignments, and resources.
            </p>
          </div>
          <div className="grid flex-1 gap-4">
            {rhythms.map((item) => (
              <article key={item.id} className="rounded-3xl border border-mssn-slate/10 bg-mssn-mist p-5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-mssn-greenDark">
                  <span>{item.time}</span>
                  <span>Camp flow</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-mssn-slate">{item.title}</h3>
                <p className="mt-3 text-sm text-mssn-slate/70">{item.details}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SupportSection({ channels, resources }) {
  return (
    <section id="support" className="mx-auto mt-24 w-full max-w-6xl px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
            Support hub
          </span>
          <h2 className="text-3xl font-semibold text-mssn-slate lg:text-4xl">Every camper gets a concierge-level experience</h2>
          <p className="text-base text-mssn-slate/70">
            Pick the pathway that matches your needs and access verified resources tailored for coordinators, sponsors, and guardians.
          </p>
        </div>
        <div className="grid gap-6">
          {channels.map((channel) => (
            <article key={channel.id} className="rounded-4xl border border-mssn-slate/10 bg-white/95 p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-mssn-slate">{channel.title}</h3>
              <p className="mt-3 text-sm text-mssn-slate/70">{channel.description}</p>
              <a
                href={channel.href}
                target={channel.href.startsWith('http') ? '_blank' : undefined}
                rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-mssn-greenDark"
              >
                {channel.action}
                <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-10 rounded-4xl bg-mssn-mist p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-mssn-slate">Essential downloads</h3>
          <span className="text-sm text-mssn-slate/70">Available right inside the portal at any time</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.href}
              target={resource.href.startsWith('http') ? '_blank' : undefined}
              rel={resource.href.startsWith('http') ? 'noreferrer' : undefined}
              className="group flex h-full flex-col justify-between rounded-3xl border border-mssn-green/20 bg-white/95 p-5 shadow-soft transition hover:border-mssn-green/40 hover:shadow-glow"
            >
              <div>
                <h4 className="text-base font-semibold text-mssn-slate">{resource.title}</h4>
                <p className="mt-2 text-sm text-mssn-slate/70">{resource.description}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-mssn-greenDark">
                Download
                <span aria-hidden="true">↓</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function PartnersSection({ partners }) {
  return (
    <section id="partners" className="mt-24 bg-gradient-to-br from-mssn-night via-mssn-green/30 to-mssn-night">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 text-white">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
              Sponsors & partners
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">Amplify your mission alongside a future-ready generation</h2>
            <p className="text-base text-white/75">
              Join forces with MSSN Lagos to power scholarships, innovation labs, and impact projects. Showcase your brand before, during, and after camp with integrated storytelling.
            </p>
            <a
              href="mailto:partners@mssnlagos.org"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-mssn-slate transition hover:bg-mssn-green hover:text-white"
            >
              Request partnership deck
              <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="grid gap-6">
            {partners.map((partner) => (
              <article key={partner.id} className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                <h3 className="text-lg font-semibold text-white">{partner.name}</h3>
                <p className="mt-2 text-sm text-white/75">{partner.message}</p>
                <a
                  href={partner.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-mssn-green"
                >
                  View partner profile
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FAQSection({ items }) {
  return (
    <section id="faq" className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="faq-heading">
      <div className="rounded-4xl bg-white/95 p-8 shadow-soft ring-1 ring-mssn-slate/10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
            FAQs
          </span>
          <h2 id="faq-heading" className="mt-4 text-3xl font-semibold sm:text-4xl">Get clarity before camp begins</h2>
          <p className="mt-4 text-base text-mssn-slate/70">
            Still have questions? Reach out to the MSSN Lagos support desk and we will walk you through every requirement.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {items.map((faq) => (
            <details key={faq.id} className="group rounded-3xl border border-mssn-slate/10 bg-mssn-mist/80 p-5">
              <summary className="flex cursor-pointer items-center justify-between text-left text-sm font-semibold text-mssn-slate">
                {faq.question}
                <span className="ml-4 text-mssn-greenDark transition group-open:rotate-90">➔</span>
              </summary>
              <p className="mt-3 text-sm text-mssn-slate/70">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function ClosingCTA() {
  return (
    <section id="cta" className="mx-auto mt-24 w-full max-w-4xl px-6 text-center">
      <div className="rounded-4xl bg-gradient-to-br from-mssn-green to-mssn-greenDark p-10 text-white shadow-glow">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
          Secure your place
        </span>
        <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Ready to experience the most immersive MSSN Lagos camp yet?</h2>
        <p className="mt-4 text-base text-white/80">
          Complete registration in minutes, reserve your bunk, and start receiving curated resources ahead of camp week.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="https://mssnlagos.org/camp/register/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-mssn-greenDark transition hover:bg-mssn-mist"
          >
            Register as a new member
          </a>
          <a
            href="https://mssnlagos.org/camp/register/returning"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Fast-track as returning member
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className="mt-24 bg-mssn-night">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 text-white/80">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="MSSN Lagos" className="h-12 w-12 rounded-3xl object-cover" />
            <div>
              <p className="text-sm font-semibold text-white">Muslim Students’ Society of Nigeria, Lagos State Area Unit</p>
              <p className="text-xs text-white/70">Empowering faith-driven leadership across campuses and communities.</p>
            </div>
          </div>
          <div className="grid gap-3 text-xs sm:grid-cols-2 sm:gap-4">
            <a href="#tracks" className="underline decoration-mssn-green/40 underline-offset-4">
              Explore camp tracks
            </a>
            <a href="#support" className="underline decoration-mssn-green/40 underline-offset-4">
              Access support hub
            </a>
            <a href="mailto:camp@mssnlagos.org" className="underline decoration-mssn-green/40 underline-offset-4">
              camp@mssnlagos.org
            </a>
            <a href="tel:+2348130001122" className="underline decoration-mssn-green/40 underline-offset-4">
              +234 813 000 1122
            </a>
          </div>
        </div>
        <p className="mt-8 text-xs text-white/60">&copy; {currentYear} MSSN Lagos State Area Unit. All rights reserved.</p>
      </div>
    </footer>
  )
}

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false)

  const closeNav = () => setIsNavOpen(false)
  const toggleNav = () => setIsNavOpen((prev) => !prev)

  return (
    <div className="flex min-h-screen flex-col bg-mssn-mist text-mssn-slate">
      <Header links={navigationLinks} isNavOpen={isNavOpen} onToggleNav={toggleNav} onCloseNav={closeNav} />
      <main className="flex-1">
        <HeroSection stories={heroStories} />
        <JourneySection milestones={milestoneTimeline} />
        <TracksSection tracks={focusTracks} />
        <ExperienceSection highlights={experienceHighlights} />
        <DailyRhythmSection rhythms={dailyRhythms} />
        <SupportSection channels={supportChannels} resources={resourceLinks} />
        <PartnersSection partners={partnerShowcase} />
        <FAQSection items={faqItems} />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  )
}

export default App
