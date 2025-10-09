import { useEffect, useState } from 'react'

const heroSlides = [
  {
    id: 'unity',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
    kicker: 'Annual Faith & Leadership Retreat',
    title: 'Reconnect. Recharge. Recommit.',
    description:
      'Journey into seven transformative days of learning, devotion, and service with Muslim youths across Lagos.',
    highlight: 'Registration for 2025 camp is now live',
  },
  {
    id: 'community',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
    kicker: 'Build lifelong bonds',
    title: 'A vibrant community anchored in faith.',
    description:
      'Engage with mentors, scholars, and peers through workshops, Qur’an circles, tech labs, and community outreach.',
    highlight: 'Mentorship clusters for every participant',
  },
  {
    id: 'focus',
    image:
      'https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1600&q=80',
    kicker: 'Leadership in Action',
    title: 'Shape the future of MSSN Lagos.',
    description:
      'Access exclusive advocacy sessions, leadership bootcamps, and professional coaching tailored for emerging leaders.',
    highlight: 'Limited accelerator slots available',
  },
]

const navigationLinks = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'reprint', label: 'Re-print Slip', href: '#reprint' },
  { id: 'lookup', label: 'Check MSSN ID', href: '#lookup' },
  {
    id: 'registration-menu',
    label: 'Registration',
    children: [
      { id: 'register-existing', label: 'Existing Member', href: '#existing-member-registration' },
      { id: 'register-new', label: 'New Member', href: '#new-member-registration' },
    ],
  },
  { id: 'contact', label: 'Contact Us', href: '#contact' },
  { id: 'advertise', label: 'Advertise With Us', href: '#advertise' },
]

const quickActions = [
  {
    id: 'quick-new',
    title: 'New Member Registration',
    description: 'Complete onboarding, medical info, and accommodation preferences in one flow.',
    href: 'https://mssnlagos.org/camp/register/new',
    external: true,
  },
  {
    id: 'quick-returning',
    title: 'Returning Member Registration',
    description: 'Verify MSSN ID, update your profile, and reserve your camp slot instantly.',
    href: 'https://mssnlagos.org/camp/register/returning',
    external: true,
  },
  {
    id: 'quick-check',
    title: 'Check MSSN ID',
    description: 'Retrieve or validate your unique identification across MSSN Lagos programs.',
    href: '#lookup',
    external: false,
  },
]

const impactStats = [
  { id: 'campers', value: '3,200+', label: 'Campers registered in 2024' },
  { id: 'facilitators', value: '120', label: 'Scholars, mentors & facilitators' },
  { id: 'scholarships', value: '250', label: 'Scholarships awarded last camp' },
  { id: 'chapters', value: '45', label: 'Participating local chapters' },
]

const featureHighlights = [
  {
    id: 'unified',
    title: 'Unified digital onboarding',
    description:
      'Register, submit documents, select accommodation, and receive confirmation without paperwork or long queues.',
  },
  {
    id: 'verification',
    title: 'Real-time MSSN ID verification',
    description:
      'Protect community data with secure, instant validation layered with SMS and email confirmations.',
  },
  {
    id: 'communication',
    title: 'Camp-wide communication tools',
    description:
      'Broadcast updates, push reminders, and manage group messaging directly from the MSSN Lagos dashboard.',
  },
]

const scheduleHighlights = [
  {
    id: 'leadership',
    title: 'Leadership Labs & Professional Clinics',
    description:
      'Scale your influence with guided workshops covering public speaking, advocacy, civic engagement, and career mentorship.',
    time: 'Morning & Afternoon Sessions',
  },
  {
    id: 'faith',
    title: 'Faith Circles & Qur’an Retreats',
    description:
      'Deepen spiritual connection through tafsir circles, tahajjud nights, and guided reflections tailored to every level.',
    time: 'Daily Sunrise & Night Sessions',
  },
  {
    id: 'wellness',
    title: 'Wellness, Sports & Community Service',
    description:
      'Participate in sports tournaments, health screenings, community outreach, and empowerment clinics for all ages.',
    time: 'Midday & Weekend Specials',
  },
]

const supportServices = [
  {
    id: 'reprint-support',
    title: 'Re-print slip',
    description:
      'Download or resend your registration slip anytime before camp check-in.',
    href: 'https://mssnlagos.org/camp/reprint',
  },
  {
    id: 'id-support',
    title: 'MSSN ID lookup',
    description:
      'Recover or validate your MSSN Lagos identification with multi-step verification.',
    href: 'https://mssnlagos.org/camp/mssn-id',
  },
]

const sponsors = [
  {
    id: 'halal-bank',
    name: 'Halal Bank Nigeria',
    message: 'Partnering to unlock ethical finance and scholarships for Muslim youths.',
    link: 'https://example.com/halal-bank',
  },
  {
    id: 'nourish-foods',
    name: 'Nourish Foods',
    message: 'Fueling every camper with healthy, balanced meals throughout camp week.',
    link: 'https://example.com/nourish-foods',
  },
  {
    id: 'technaija',
    name: 'TechNaija STEM',
    message: 'Providing mentorship and innovation labs for aspiring engineers and creators.',
    link: 'https://example.com/technaija',
  },
]

const faqs = [
  {
    id: 'payment',
    question: 'What payment options are available for registration?',
    answer:
      'You can complete payment online via secure card channels or bank transfer. When paying offline, upload your receipt for instant verification.',
  },
  {
    id: 'documents',
    question: 'Which documents should I bring to camp?',
    answer:
      'Bring a valid MSSN ID (digital or printed), registration slip, guardian consent for minors, and any medical reports you shared during onboarding.',
  },
  {
    id: 'accommodation',
    question: 'How are accommodation preferences assigned?',
    answer:
      'Our portal lets you rank choices. Placements prioritize safety, age groups, and accessibility requests logged during registration.',
  },
]

function App() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isRegistrationMenuOpen, setIsRegistrationMenuOpen] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 7000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isNavOpen) {
      setIsRegistrationMenuOpen(false)
    }
  }, [isNavOpen])

  const currentSlide = heroSlides[activeSlide]

  const closeMenus = () => {
    setIsNavOpen(false)
    setIsRegistrationMenuOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-mssn-mist text-mssn-slate">
      <header
        id="home"
        className="sticky top-0 z-50 border-b border-white/60 bg-white/90 shadow-sm backdrop-blur"
      >
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
          <a
            href="#home"
            onClick={closeMenus}
            className="group inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-mssn-slate shadow-sm ring-1 ring-mssn-green/20 transition hover:bg-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mssn-green to-mssn-greenDark text-sm font-bold text-white">
              MSSN
            </span>
            <span className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-mssn-greenDark">
                Lagos State Area Unit
              </span>
              <span className="text-base">Camp Experience Portal</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex">
            {navigationLinks.map((item) => {
              if (!item.children) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={closeMenus}
                    className="hover:text-mssn-greenDark"
                  >
                    {item.label}
                  </a>
                )
              }

              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRegistrationMenuOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-4 py-2 text-sm font-semibold text-mssn-greenDark transition hover:bg-mssn-green/20"
                    aria-haspopup="true"
                    aria-expanded={isRegistrationMenuOpen}
                  >
                    {item.label}
                    <span className="text-xs">▾</span>
                  </button>
                  <div
                    className={`absolute left-0 top-full mt-3 min-w-[220px] rounded-2xl bg-white p-4 shadow-soft ring-1 ring-mssn-slate/10 transition duration-200 ${
                      isRegistrationMenuOpen
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-2 opacity-0'
                    }`}
                  >
                    {item.children.map((child) => (
                      <a
                        key={child.id}
                        href={child.href}
                        onClick={closeMenus}
                        className="block rounded-xl px-4 py-2 text-sm text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </nav>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-mssn-slate/10 bg-white text-mssn-slate transition hover:border-mssn-green/40 hover:text-mssn-greenDark lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isNavOpen}
            onClick={() => setIsNavOpen((prev) => !prev)}
          >
            <span className="text-lg">☰</span>
          </button>
        </div>

        <nav
          className={`lg:hidden transition-all duration-300 ${
            isNavOpen ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 pb-6">
            {navigationLinks.map((item) => {
              if (!item.children) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={closeMenus}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-mssn-slate shadow-sm ring-1 ring-mssn-slate/10"
                  >
                    {item.label}
                  </a>
                )
              }

              return (
                <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-mssn-slate/10">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-sm font-semibold text-mssn-greenDark"
                    onClick={() => setIsRegistrationMenuOpen((prev) => !prev)}
                    aria-expanded={isRegistrationMenuOpen}
                  >
                    {item.label}
                    <span className="text-xs">▾</span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      isRegistrationMenuOpen ? 'mt-3 max-h-40' : 'max-h-0'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      {item.children.map((child) => (
                        <a
                          key={child.id}
                          href={child.href}
                          onClick={closeMenus}
                          className="rounded-xl bg-mssn-mist px-4 py-2 text-sm text-mssn-slate"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-mssn-night">
          <div className="absolute inset-0">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-mssn-night/95 via-mssn-night/80 to-mssn-green/45" />
          </div>
          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-6 text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-green">
                {currentSlide.kicker}
              </span>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                {currentSlide.title}
              </h1>
              <p className="max-w-2xl text-lg text-white/80 lg:text-xl">
                {currentSlide.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#registration"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-2px]"
                >
                  Register for camp
                </a>
                <a
                  href="#camp-highlights"
                  className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Explore the experience
                </a>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-4 text-sm text-white/75 backdrop-blur">
                {currentSlide.highlight}
              </div>
              <div className="flex items-center gap-4">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 w-10 rounded-full transition ${
                      index === activeSlide ? 'bg-white' : 'bg-white/40'
                    }`}
                    aria-label={`View slide ${index + 1}`}
                    aria-pressed={index === activeSlide}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-6">
              <div className="rounded-4xl border border-white/10 bg-white/10 p-6 text-white/85 backdrop-blur">
                <h2 className="text-xl font-semibold text-white">Why our camp matters</h2>
                <p className="mt-3 text-sm text-white/70">
                  MSSN Lagos is accelerating faith-driven leadership, digital literacy, and socio-economic empowerment through immersive experiences and community support.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-mssn-green" aria-hidden="true" />
                    <span>Personalized learning paths for every attendee.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-mssn-green" aria-hidden="true" />
                    <span>Secure, paperless processing for registrations and verifications.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-mssn-green" aria-hidden="true" />
                    <span>Dedicated mentorship, wellness, and service initiatives.</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-4xl border border-white/10 bg-white/10 p-6 text-white/85 backdrop-blur">
                <h2 className="text-xl font-semibold text-white">Key reminders</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>
                    • Carry your MSSN slip (digital or printed) for entry.
                  </li>
                  <li>
                    • Submit sponsorship assets before <strong>1st August</strong> for camp visibility.
                  </li>
                  <li>
                    • Join the onboarding webinar once your registration is approved.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto -mt-24 w-full max-w-6xl px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {quickActions.map((action) => (
              <a
                key={action.id}
                href={action.href}
                onClick={action.external ? undefined : closeMenus}
                target={action.external ? '_blank' : undefined}
                rel={action.external ? 'noreferrer' : undefined}
                className="group rounded-4xl border border-mssn-slate/10 bg-white/95 p-6 shadow-soft transition hover:-translate-y-1 hover:border-mssn-green/40 hover:shadow-glow"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-mssn-greenDark">
                  Quick Action
                </span>
                <h3 className="mt-4 text-xl font-semibold text-mssn-slate">{action.title}</h3>
                <p className="mt-3 text-sm text-mssn-slate/70">{action.description}</p>
                <span className="mt-6 inline-flex items-center gap-3 text-sm font-semibold text-mssn-greenDark">
                  Continue
                  <span aria-hidden="true">→</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <section
          id="camp-highlights"
          className="mx-auto mt-32 w-full max-w-6xl px-6"
          aria-labelledby="camp-highlights-heading"
        >
          <div className="rounded-4xl bg-white/90 p-10 shadow-soft ring-1 ring-mssn-slate/10">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
                  Impact
                </span>
                <h2 id="camp-highlights-heading" className="text-3xl font-semibold text-mssn-slate lg:text-4xl">
                  Digitizing the MSSN Lagos camp journey end-to-end
                </h2>
                <p className="text-base text-mssn-slate/70">
                  Our platform powers registration, verification, communication, and sponsorship experiences—reducing manual workloads while elevating camp impact.
                </p>
              </div>
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                {impactStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="rounded-3xl border border-mssn-slate/10 bg-mssn-mist p-5 text-center shadow-sm"
                  >
                    <span className="text-3xl font-semibold text-mssn-greenDark">{stat.value}</span>
                    <p className="mt-2 text-sm text-mssn-slate/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="features-heading">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
                Platform Features
                </span>
              <h2 id="features-heading" className="text-3xl font-semibold lg:text-4xl">
                Powerful tools for coordinators, registrants, and partners
              </h2>
              <p className="text-base text-mssn-slate/70">
                MSSN Lagos Unit Camp Site streamlines onboarding, strengthens data accuracy, and increases visibility for sponsors through a secure ecosystem.
              </p>
            </div>
            <div className="grid flex-1 gap-6 sm:grid-cols-2">
              {featureHighlights.map((feature) => (
                <article
                  key={feature.id}
                  className="rounded-4xl border border-mssn-slate/10 bg-white/95 p-6 shadow-soft transition hover:-translate-y-1 hover:border-mssn-green/30"
                >
                  <h3 className="text-xl font-semibold text-mssn-slate">{feature.title}</h3>
                  <p className="mt-3 text-sm text-mssn-slate/70">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="registration"
          className="mt-24 bg-gradient-to-br from-mssn-green/12 via-white to-mssn-green/10"
          aria-labelledby="registration-heading"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
                Registration Flows
              </span>
              <h2 id="registration-heading" className="mt-4 text-3xl font-semibold sm:text-4xl">
                Join or return to MSSN Lagos camp in minutes
              </h2>
              <p className="mt-4 text-base text-mssn-slate/70">
                Whether you are a first-timer or returning member, the portal guides you through smart, secure steps tailored to your journey.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <article
                id="new-member-registration"
                aria-labelledby="new-member-heading"
                className="flex h-full flex-col justify-between rounded-4xl border border-mssn-green/20 bg-white/95 p-8 shadow-soft"
              >
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-mssn-greenDark">
                    New Members
                  </span>
                  <div>
                    <h3 id="new-member-heading" className="text-2xl font-semibold text-mssn-slate">
                      Create your first camp profile
                    </h3>
                    <p className="mt-3 text-sm text-mssn-slate/70">
                      Submit personal details, guardians, medical notes, and accommodation preferences. Receive onboarding resources immediately.
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm text-mssn-slate/70">
                    <li>• Digital identity creation and biometric-ready QR codes.</li>
                    <li>• Instant confirmation emails and SMS alerts.</li>
                    <li>• Access to pre-camp webinars and mentorship channels.</li>
                  </ul>
                </div>
                <a
                  href="https://mssnlagos.org/camp/register/new"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-2px]"
                >
                  Start new member registration
                </a>
              </article>

              <article
                id="existing-member-registration"
                aria-labelledby="existing-member-heading"
                className="flex h-full flex-col justify-between rounded-4xl border border-mssn-green/20 bg-white/95 p-8 shadow-soft"
              >
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-mssn-greenDark">
                    Returning Members
                  </span>
                  <div>
                    <h3 id="existing-member-heading" className="text-2xl font-semibold text-mssn-slate">
                      Update your previous record
                    </h3>
                    <p className="mt-3 text-sm text-mssn-slate/70">
                      Log in with your MSSN ID, review stored details, and confirm your slot without repeating the full process.
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm text-mssn-slate/70">
                    <li>• Pre-filled data with secure biometric confirmation.</li>
                    <li>• Ability to add dependents or group registrations.</li>
                    <li>• Export history reports for your local chapter.</li>
                  </ul>
                </div>
                <a
                  href="https://mssnlagos.org/camp/register/returning"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center justify-center rounded-full border border-mssn-green/40 bg-white px-6 py-3 text-sm font-semibold text-mssn-greenDark transition hover:bg-mssn-green/10"
                >
                  Continue as existing member
                </a>
              </article>
            </div>
          </div>
        </section>

        <section
          id="reprint"
          className="mx-auto mt-24 w-full max-w-6xl px-6"
          aria-labelledby="self-service-heading"
        >
          <div className="rounded-4xl bg-white/95 p-8 shadow-soft ring-1 ring-mssn-slate/10">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
                  Self-Service
                </span>
                <h2 id="self-service-heading" className="text-3xl font-semibold">
                  Manage your registration anytime, anywhere
                </h2>
                <p className="text-base text-mssn-slate/70">
                  Reprint slips, validate IDs, or share details with coordinators. Everything happens instantly across secure MSSN infrastructure.
                </p>
              </div>
              <div id="lookup" className="grid flex-1 gap-6 sm:grid-cols-2">
                {supportServices.map((service) => (
                  <article
                    key={service.id}
                    className="flex h-full flex-col justify-between rounded-3xl border border-mssn-slate/10 bg-mssn-mist p-6"
                  >
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-mssn-slate">{service.title}</h3>
                      <p className="text-sm text-mssn-slate/70">{service.description}</p>
                    </div>
                    <a
                      href={service.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-mssn-greenDark"
                    >
                      Access service
                      <span aria-hidden="true">↗</span>
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="schedule-heading">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
                Camp Blueprint
              </span>
              <h2 id="schedule-heading" className="text-3xl font-semibold lg:text-4xl">
                Curated sessions for spiritual depth, leadership, and wellness
              </h2>
              <p className="text-base text-mssn-slate/70">
                Every day at camp is designed to balance devotion, knowledge, fellowship, and impact. Discover a preview of what awaits.
              </p>
              <a
                href="https://mssnlagos.org"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-mssn-slate px-5 py-3 text-sm font-semibold text-white transition hover:bg-mssn-greenDark"
              >
                View detailed schedule
                <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="space-y-4">
              {scheduleHighlights.map((item) => (
                <article
                  key={item.id}
                  className="rounded-4xl border border-mssn-slate/10 bg-white/95 p-6 shadow-soft"
                >
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-mssn-greenDark">
                    <span>{item.time}</span>
                    <span>Camp Feature</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-mssn-slate">{item.title}</h3>
                  <p className="mt-3 text-sm text-mssn-slate/70">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="advertise"
          className="mt-24 bg-gradient-to-br from-mssn-night via-mssn-green/30 to-mssn-night"
          aria-labelledby="sponsors-heading"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-24 text-white">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                  Sponsors & Partners
                </span>
                <h2 id="sponsors-heading" className="text-3xl font-semibold sm:text-4xl">
                  Amplify your message before, during, and after camp
                </h2>
                <p className="text-base text-white/75">
                  Showcase your products, scholarships, or services to thousands of Muslim youths, professionals, and leaders. Gain visibility through the portal, livestreams, and on-ground activations.
                </p>
                <a
                  href="mailto:partners@mssnlagos.org"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-mssn-slate transition hover:bg-mssn-green hover:text-white"
                >
                  Request media kit
                  <span aria-hidden="true">→</span>
                </a>
              </div>
              <div className="grid gap-6">
                {sponsors.map((sponsor) => (
                  <article
                    key={sponsor.id}
                    className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur"
                  >
                    <h3 className="text-lg font-semibold text-white">{sponsor.name}</h3>
                    <p className="mt-2 text-sm text-white/75">{sponsor.message}</p>
                    <a
                      href={sponsor.link}
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

        <section className="mx-auto mt-24 w-full max-w-6xl px-6" aria-labelledby="faq-heading">
          <div className="rounded-4xl bg-white/95 p-8 shadow-soft ring-1 ring-mssn-slate/10">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
                FAQs
              </span>
              <h2 id="faq-heading" className="mt-4 text-3xl font-semibold sm:text-4xl">
                Answers to common questions
              </h2>
              <p className="mt-4 text-base text-mssn-slate/70">
                Get prepared before camp begins. Reach out to the MSSN Lagos team for any clarifications beyond these highlights.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group rounded-3xl border border-mssn-slate/10 bg-mssn-mist/80 p-5"
                >
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

        <section
          id="contact"
          className="mx-auto mt-24 w-full max-w-6xl px-6"
          aria-labelledby="contact-heading"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
                Stay Connected
              </span>
              <h2 id="contact-heading" className="text-3xl font-semibold lg:text-4xl">
                Contact the MSSN Lagos team
              </h2>
              <p className="text-base text-mssn-slate/70">
                Need help with registration, sponsorships, or volunteering? Send us a message and we will respond within 24 hours.
              </p>
              <ul className="space-y-3 text-sm text-mssn-slate/80">
                <li>
                  <span className="font-semibold text-mssn-greenDark">Email:</span>{' '}
                  <a className="underline decoration-mssn-green/40 underline-offset-4" href="mailto:camp@mssnlagos.org">
                    camp@mssnlagos.org
                  </a>
                </li>
                <li>
                  <span className="font-semibold text-mssn-greenDark">Phone:</span>{' '}
                  <a className="underline decoration-mssn-green/40 underline-offset-4" href="tel:+2348130001122">
                    +234 813 000 1122
                  </a>
                </li>
                <li>
                  <span className="font-semibold text-mssn-greenDark">Office:</span> MSSN Lagos Secretariat, 10 Community Way, Yaba, Lagos.
                </li>
              </ul>
            </div>
            <form
              className="rounded-4xl border border-mssn-slate/10 bg-white/95 p-8 shadow-soft"
              aria-label="Subscribe to MSSN camp newsletter"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">
                Newsletter
              </span>
              <h3 className="mt-3 text-2xl font-semibold text-mssn-slate">
                Receive camp announcements, packing lists, and scholarship alerts
              </h3>
              <label className="mt-6 block text-sm font-medium text-mssn-slate" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3 text-sm text-mssn-slate outline-none transition focus:border-mssn-green focus:ring-2 focus:ring-mssn-green/40"
                type="email"
                id="newsletter-email"
                name="email"
                placeholder="Enter your email"
                required
              />
              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-2px]"
              >
                Join the mailing list
              </button>
              <p className="mt-3 text-xs text-mssn-slate/60">
                We respect your inbox. Expect essential camp updates only.
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="mt-24 bg-mssn-night">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-white/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-mssn-green to-mssn-greenDark text-sm font-bold text-white">
                MSSN
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">
                  Muslim Students’ Society of Nigeria, Lagos State Area Unit
                </span>
                <span className="text-xs text-white/70">
                  Building faith, knowledge, and unity across campuses
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <a href="#registration" className="underline decoration-mssn-green/40 underline-offset-4">
                Register now
              </a>
              <a href="#reprint" className="underline decoration-mssn-green/40 underline-offset-4">
                Re-print slip
              </a>
              <a href="#contact" className="underline decoration-mssn-green/40 underline-offset-4">
                Contact support
              </a>
            </div>
          </div>
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} MSSN Lagos State Area Unit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
