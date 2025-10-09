import { useEffect, useState } from 'react'
import './App.css'

const sliderContent = [
  {
    id: 'arrival',
    image:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80',
    title: 'Welcome to MSSN Lagos Camp',
    description:
      'Reunite with fellow believers, build lasting friendships, and strengthen your faith in a serene environment.',
  },
  {
    id: 'lecture',
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80',
    title: 'Gatherings that Inspire',
    description:
      'Experience transformative lectures, workshops, and spiritual sessions curated for both new and returning members.',
  },
  {
    id: 'community',
    image:
      'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1400&q=80',
    title: 'A Community that Cares',
    description:
      'Stay connected with MSSN Lagos through digital tools that simplify registration, verification, and communication.',
  },
]

const quickActions = [
  {
    id: 'register-new',
    label: 'New Member',
    description: 'First time at camp? Complete your registration in minutes.',
    href: '#new-member-registration',
  },
  {
    id: 'register-existing',
    label: 'Returning Member',
    description: 'Update your details and secure your slot for this year.',
    href: '#existing-member-registration',
  },
  {
    id: 'verify-id',
    label: 'Check MSSN ID',
    description: 'Verify or retrieve your MSSN Lagos identification number.',
    href: '#mssn-id-lookup',
  },
]

const sponsorSpots = [
  {
    id: 'halal-bank',
    name: 'Halal Bank Nigeria',
    message: 'Empowering ethical finance for the Muslim community.',
    link: 'https://example.com/halal-bank',
  },
  {
    id: 'nourish',
    name: 'Nourish Foods',
    message: 'Healthy meals served throughout camp week.',
    link: 'https://example.com/nourish-foods',
  },
  {
    id: 'technaija',
    name: 'TechNaija STEM',
    message: 'Unlock scholarships for aspiring engineers in Lagos.',
    link: 'https://example.com/technaija',
  },
]

function App() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [navOpen, setNavOpen] = useState(false)
  const [registrationOpen, setRegistrationOpen] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderContent.length)
    }, 6000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!navOpen) {
      setRegistrationOpen(false)
    }
  }, [navOpen])

  const toggleMobileNav = () => {
    setNavOpen((prev) => !prev)
  }

  const toggleRegistrationMenu = () => {
    setRegistrationOpen((prev) => !prev)
  }

  const handleNavigate = () => {
    setNavOpen(false)
    setRegistrationOpen(false)
  }

  const currentSlide = sliderContent[activeSlide]

  return (
    <div className="site-wrapper">
      <header className="site-header" id="home">
        <div className="header-inner">
          <a className="brand-anchor" href="#home" onClick={handleNavigate}>
            <div className="brand-mark" aria-hidden="true">
              MSSN
            </div>
            <div className="brand-text">
              <span className="brand-name">MSSN Lagos Unit</span>
              <span className="brand-tagline">Annual Camp Portal</span>
            </div>
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-controls="primary-navigation"
            aria-expanded={navOpen}
            onClick={toggleMobileNav}
          >
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-label">Menu</span>
          </button>
          <nav
            className={`site-navigation${navOpen ? ' is-open' : ''}`}
            id="primary-navigation"
          >
            <ul className="navigation-list">
              <li className="navigation-item">
                <a className="navigation-link" href="#home" onClick={handleNavigate}>
                  Home
                </a>
              </li>
              <li className="navigation-item">
                <a
                  className="navigation-link"
                  href="#reprint-slip"
                  onClick={handleNavigate}
                >
                  Re-print Slip
                </a>
              </li>
              <li className="navigation-item">
                <a
                  className="navigation-link"
                  href="#mssn-id-lookup"
                  onClick={handleNavigate}
                >
                  Check MSSN ID
                </a>
              </li>
              <li className="navigation-item has-children">
                <button
                  className="navigation-link registration-toggle"
                  type="button"
                  aria-expanded={registrationOpen}
                  onClick={toggleRegistrationMenu}
                >
                  Registration
                </button>
                <ul
                  className={`sub-navigation${registrationOpen ? ' is-visible' : ''}`}
                  role="menu"
                >
                  <li className="sub-navigation-item" role="none">
                    <a
                      className="sub-navigation-link"
                      href="#existing-member-registration"
                      role="menuitem"
                      onClick={handleNavigate}
                    >
                      Existing Member
                    </a>
                  </li>
                  <li className="sub-navigation-item" role="none">
                    <a
                      className="sub-navigation-link"
                      href="#new-member-registration"
                      role="menuitem"
                      onClick={handleNavigate}
                    >
                      New Member
                    </a>
                  </li>
                </ul>
              </li>
              <li className="navigation-item">
                <a
                  className="navigation-link"
                  href="#contact"
                  onClick={handleNavigate}
                >
                  Contact Us
                </a>
              </li>
              <li className="navigation-item">
                <a
                  className="navigation-link"
                  href="#advertise"
                  onClick={handleNavigate}
                >
                  Advertise With Us
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="site-main">
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="hero-slider" role="presentation">
            <img
              className="hero-slide-image"
              src={currentSlide.image}
              alt={currentSlide.title}
            />
            <div className="hero-gradient" aria-hidden="true" />
          </div>
          <div className="hero-overlay">
            <h1 className="hero-heading" id="hero-heading">
              MSSN Lagos Unit Camp Site
            </h1>
            <p className="hero-subheading">{currentSlide.description}</p>
            <div className="hero-cta-group">
              <a className="hero-primary-cta" href="#new-member-registration">
                Register Now
              </a>
              <a className="hero-secondary-cta" href="#learn-more">
                Learn about camp
              </a>
            </div>
          </div>
          <div className="slider-indicators" role="group" aria-label="Slide selector">
            {sliderContent.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`indicator-dot${index === activeSlide ? ' is-active' : ''}`}
                aria-label={`Show slide ${index + 1}: ${slide.title}`}
                aria-pressed={index === activeSlide}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
          <div className="quick-action-panel">
            {quickActions.map((action) => (
              <a key={action.id} className="quick-action-card" href={action.href}>
                <span className="quick-action-label">{action.label}</span>
                <span className="quick-action-description">{action.description}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="about-section" id="learn-more" aria-labelledby="about-heading">
          <div className="section-container">
            <div className="section-header">
              <span className="section-eyebrow">Why MSSN Camp</span>
              <h2 className="section-heading" id="about-heading">
                Digitized experience built for our community
              </h2>
              <p className="section-introduction">
                MSSN Lagos Unit Camp Site streamlines registrations, supports returning attendees, and strengthens partnerships with sponsors who share our values.
              </p>
            </div>
            <div className="benefit-grid">
              <article className="benefit-card">
                <h3 className="benefit-title">Centralized Registration</h3>
                <p className="benefit-description">
                  Register new participants, update existing records, and keep track of every camper through one unified portal.
                </p>
              </article>
              <article className="benefit-card">
                <h3 className="benefit-title">Accurate Member Data</h3>
                <p className="benefit-description">
                  Built-in MSSN ID verification tools ensure every entry is legitimate, helping coordinators manage attendees with confidence.
                </p>
              </article>
              <article className="benefit-card">
                <h3 className="benefit-title">Sponsor Visibility</h3>
                <p className="benefit-description">
                  Dedicated advertisement space allows partners to reach thousands of engaged Muslim youths and professionals.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="registration-section"
          id="registration"
          aria-labelledby="registration-heading"
        >
          <div className="section-container">
            <div className="section-header">
              <span className="section-eyebrow">Registration</span>
              <h2 className="section-heading" id="registration-heading">
                Join or return to MSSN Lagos Camp
              </h2>
              <p className="section-introduction">
                Whether this is your first time or you are a returning member, the camp portal makes onboarding seamless.
              </p>
            </div>
            <div className="registration-grid">
              <article
                className="registration-card"
                id="new-member-registration"
                aria-labelledby="new-member-title"
              >
                <div className="registration-status">New members</div>
                <h3 className="registration-title" id="new-member-title">
                  Create your camp profile
                </h3>
                <p className="registration-description">
                  Submit your personal information, emergency contacts, and accommodation preferences. Receive a confirmation email instantly.
                </p>
                <a className="registration-link" href="https://mssnlagos.org/camp/register/new" target="_blank" rel="noreferrer">
                  Start new member registration
                </a>
              </article>
              <article
                className="registration-card"
                id="existing-member-registration"
                aria-labelledby="existing-member-title"
              >
                <div className="registration-status">Returning members</div>
                <h3 className="registration-title" id="existing-member-title">
                  Update your previous record
                </h3>
                <p className="registration-description">
                  Log in with your MSSN ID, review your stored data, and confirm your attendance without repeating the full form.
                </p>
                <a className="registration-link" href="https://mssnlagos.org/camp/register/returning" target="_blank" rel="noreferrer">
                  Continue as existing member
                </a>
              </article>
            </div>
          </div>
        </section>

        <section
          className="support-section"
          id="reprint-slip"
          aria-labelledby="support-heading"
        >
          <div className="section-container">
            <div className="section-header">
              <span className="section-eyebrow">Self-Service</span>
              <h2 className="section-heading" id="support-heading">
                Manage your registration anytime
              </h2>
              <p className="section-introduction">
                Tools built to keep you informed and prepared before camp begins.
              </p>
            </div>
            <div className="support-grid">
              <article className="support-card" aria-labelledby="reprint-title">
                <h3 className="support-title" id="reprint-title">
                  Re-print slip
                </h3>
                <p className="support-description">
                  Access your registration slip, download it as PDF, or send it to your email. Helpful reminders keep you ready for check-in.
                </p>
                <a className="support-link" href="https://mssnlagos.org/camp/reprint" target="_blank" rel="noreferrer">
                  Reprint my slip
                </a>
              </article>
              <article
                className="support-card"
                id="mssn-id-lookup"
                aria-labelledby="id-lookup-title"
              >
                <h3 className="support-title" id="id-lookup-title">
                  MSSN ID lookup
                </h3>
                <p className="support-description">
                  Validate your identification number or retrieve it using your registered email and phone number.
                </p>
                <a className="support-link" href="https://mssnlagos.org/camp/mssn-id" target="_blank" rel="noreferrer">
                  Check my MSSN ID
                </a>
              </article>
            </div>
          </div>
        </section>

        <section
          className="advertisement-section"
          id="advertise"
          aria-labelledby="advertisement-heading"
        >
          <div className="section-container">
            <div className="section-header">
              <span className="section-eyebrow">Sponsors & Partners</span>
              <h2 className="section-heading" id="advertisement-heading">
                Amplify your message during camp
              </h2>
              <p className="section-introduction">
                Reach a dedicated audience before, during, and after camp. Showcase your services where they matter most.
              </p>
            </div>
            <div className="sponsor-grid">
              {sponsorSpots.map((sponsor) => (
                <article
                  key={sponsor.id}
                  className="sponsor-card"
                  aria-label={`${sponsor.name} advertisement`}
                >
                  <h3 className="sponsor-name">{sponsor.name}</h3>
                  <p className="sponsor-message">{sponsor.message}</p>
                  <a className="sponsor-link" href={sponsor.link} target="_blank" rel="noreferrer">
                    View partner profile
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-heading">
          <div className="section-container">
            <div className="contact-grid">
              <div className="contact-column">
                <span className="section-eyebrow">Stay Connected</span>
                <h2 className="section-heading" id="contact-heading">
                  Contact the MSSN Lagos team
                </h2>
                <p className="section-introduction">
                  Have questions about the upcoming camp, sponsorships, or volunteering? Reach out and we will respond within 24 hours.
                </p>
                <ul className="contact-list">
                  <li className="contact-item">
                    <span className="contact-label">Email</span>
                    <a className="contact-link" href="mailto:camp@mssnlagos.org">
                      camp@mssnlagos.org
                    </a>
                  </li>
                  <li className="contact-item">
                    <span className="contact-label">Phone</span>
                    <a className="contact-link" href="tel:+2348130001122">
                      +234 813 000 1122
                    </a>
                  </li>
                  <li className="contact-item">
                    <span className="contact-label">Office</span>
                    <span className="contact-detail">
                      MSSN Lagos Secretariat, 10 Community Way, Yaba, Lagos.
                    </span>
                  </li>
                </ul>
              </div>
              <form className="newsletter-form" aria-label="Subscribe to MSSN camp newsletter">
                <span className="newsletter-heading">Subscribe for updates</span>
                <label className="newsletter-label" htmlFor="newsletter-email">
                  Receive camp reminders, packing checklists, and announcements directly in your inbox.
                </label>
                <input
                  className="newsletter-input"
                  type="email"
                  id="newsletter-email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                />
                <button className="newsletter-submit" type="submit">
                  Join the mailing list
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" aria-label="Footer">
        <div className="section-container footer-container">
          <div className="footer-brand">
            <div className="footer-mark" aria-hidden="true">
              MSSN
            </div>
            <div className="footer-text">
              <span className="footer-name">MSSN Lagos State Area Unit</span>
              <span className="footer-tagline">Building faith, knowledge, and unity</span>
            </div>
          </div>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Muslim Students’ Society of Nigeria, Lagos State Area Unit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
