import { useEffect, useMemo, useRef, useState } from 'react'
import { isModifiedEvent, navigate } from '../utils/navigation.js'
import { useSettings } from '../context/SettingsContext.jsx'
import FullPageLoader from './FullPageLoader.jsx'
import PwaInstallPrompt from './PwaInstallPrompt.jsx'
import WhatsAppWidget from './WhatsAppWidget.jsx'

const logoUrl = 'https://camp.mssnlagos.net/assets/thumbnail_large.png'

function Header({ isNavOpen, onToggleNav, onCloseNav }) {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const registrationRef = useRef(null)
  const closeTimeoutRef = useRef(null)

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const openRegistration = () => {
    clearCloseTimeout()
    setIsRegistrationOpen(true)
  }

  const scheduleCloseRegistration = () => {
    clearCloseTimeout()
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsRegistrationOpen(false)
      closeTimeoutRef.current = null
    }, 150)
  }

  const handleButtonClick = () => {
    if (isRegistrationOpen) {
      setIsRegistrationOpen(false)
    } else {
      openRegistration()
    }
  }

  const handleMenuBlur = (event) => {
    if (!registrationRef.current?.contains(event.relatedTarget)) {
      scheduleCloseRegistration()
    }
  }

  const handleButtonKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsRegistrationOpen(false)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleButtonClick()
    }
  }

  const shouldHandleLink = (event) => {
    if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) {
      return false
    }
    if (event.currentTarget instanceof HTMLAnchorElement && event.currentTarget.target === '_blank') {
      return false
    }
    return true
  }

  const createRouteHandler = (path, { replace = false, closeNav = true } = {}) => (event) => {
    if (!shouldHandleLink(event)) {
      return
    }
    event.preventDefault()
    setIsRegistrationOpen(false)
    if (closeNav) {
      onCloseNav()
    }
    navigate(path, { replace })
  }

  useEffect(() => () => clearCloseTimeout(), [])

  const [isMobileRegOpen, setIsMobileRegOpen] = useState(false)
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const update = () => setPath(window.location.pathname)
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCloseNav() }
    if (isNavOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isNavOpen])
  const isActive = (href) => path === href || (href !== '/' && path.startsWith(href))

  return (
    <header className="sticky top-0 z-40 border-b border-mssn-slate/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <a
          href="/"
          className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-mssn-slate shadow-soft ring-1 ring-mssn-green/20 transition hover:bg-white"
          onClick={createRouteHandler('/')}
        >
          <img src={logoUrl} alt="MSSN Lagos" className="h-12 w-12 rounded-3xl object-cover shadow-soft ring-1 ring-white/40" />
          <span className="flex flex-col text-left">
            <span className="text-xs uppercase tracking-[0.18em] text-mssn-greenDark">MSSN Lagos</span>
            <span className="text-base">Camp Experience Portal</span>
          </span>
        </a>
        <nav className="hidden items-center gap-2 text-sm font-semibold lg:flex">
          <a href="/" onClick={createRouteHandler('/')} className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark">Home</a>
          <a href="/reprint-slip" onClick={createRouteHandler('/reprint-slip', { closeNav: false })} className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark">Re-print Slip</a>
          <a href="/check-mssn-id" onClick={createRouteHandler('/check-mssn-id', { closeNav: false })} className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark">Check MSSN ID</a>
          <div
            ref={registrationRef}
            className="relative"
            onMouseEnter={openRegistration}
            onMouseLeave={scheduleCloseRegistration}
            onFocus={openRegistration}
            onBlur={handleMenuBlur}
          >
            <button
              type="button"
              className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark"
              aria-haspopup="true"
              aria-expanded={isRegistrationOpen}
              onClick={handleButtonClick}
              onKeyDown={handleButtonKeyDown}
            >
              Registration ▾
            </button>
            <div
              className={`absolute left-0 top-full z-50 mt-2 w-56 overflow-visible rounded-2xl border border-mssn-slate/10 bg-white p-2 shadow-soft transition duration-200 ${
                isRegistrationOpen ? 'visible translate-y-1 opacity-100' : 'invisible -translate-y-1 opacity-0 pointer-events-none'
              }`}
            >
              <a href="/existing/validate" onClick={createRouteHandler('/existing/validate', { closeNav: false })} className="block rounded-xl px-3 py-2 text-sm text-mssn-slate hover:bg-mssn-mist">Existing Member</a>
              <a href="/new" onClick={createRouteHandler('/new', { closeNav: false })} className="block rounded-xl px-3 py-2 text-sm text-mssn-slate hover:bg-mssn-mist">New Member</a>
            </div>
          </div>
          <a href="/contact" onClick={createRouteHandler('/contact', { closeNav: false })} className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark">Contact Us</a>
        </nav>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-mssn-slate/10 bg-white text-mssn-slate transition hover:border-mssn-green/40 hover:text-mssn-greenDark lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isNavOpen}
          onClick={onToggleNav}
        >
          <span className="text-lg">{isNavOpen ? '✕' : '☰'}</span>
        </button>
      </div>
      <div className={`fixed inset-0 z-50 lg:hidden ${isNavOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isNavOpen}>
        <div className={`absolute inset-0 bg-mssn-night/50 transition-opacity ${isNavOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onCloseNav} />
        <aside className={`absolute right-0 top-0 h-full w-[20rem] max-w-[90vw] transform bg-white shadow-soft ring-1 ring-mssn-slate/10 transition-transform duration-300 ${isNavOpen ? 'translate-x-0' : 'translate-x-full'}`} role="dialog" aria-modal="true">
          <div className="flex items-center justify-between border-b border-mssn-slate/10 px-5 py-4">
            <span className="text-sm font-semibold text-mssn-slate">Menu</span>
            <button type="button" onClick={onCloseNav} className="rounded-lg p-2 text-mssn-slate/70 transition hover:bg-mssn-mist hover:text-mssn-slate">✕</button>
          </div>
          <div className="flex h-[calc(100%-56px)] flex-col gap-2 overflow-y-auto p-4">
            <a href="/" onClick={createRouteHandler('/')} className={`${isActive('/') ? 'bg-mssn-green/10 text-mssn-greenDark' : 'bg-white text-mssn-slate'} rounded-xl px-4 py-3 text-sm font-semibold ring-1 ring-mssn-slate/10 hover:ring-mssn-green/40`}>Home</a>
            <a href="/reprint-slip" onClick={createRouteHandler('/reprint-slip')} className={`${isActive('/reprint-slip') ? 'bg-mssn-green/10 text-mssn-greenDark' : 'bg-white text-mssn-slate'} rounded-xl px-4 py-3 text-sm font-semibold ring-1 ring-mssn-slate/10 hover:ring-mssn-green/40`}>Re-print Slip</a>
            <a href="/check-mssn-id" onClick={createRouteHandler('/check-mssn-id')} className={`${isActive('/check-mssn-id') ? 'bg-mssn-green/10 text-mssn-greenDark' : 'bg-white text-mssn-slate'} rounded-xl px-4 py-3 text-sm font-semibold ring-1 ring-mssn-slate/10 hover:ring-mssn-green/40`}>Check MSSN ID</a>
            <div className="rounded-2xl ring-1 ring-mssn-slate/10">
              <button type="button" onClick={() => setIsMobileRegOpen((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-mssn-slate">
                <span>Registration</span>
                <span className={`transition-transform ${isMobileRegOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              <div className={`overflow-hidden transition-all ${isMobileRegOpen ? 'max-h-60' : 'max-h-0'}`}>
                <a href="/existing/validate" onClick={createRouteHandler('/existing/validate')} className={`block px-4 py-2 text-sm hover:bg-mssn-mist ${isActive('/existing') ? 'bg-mssn-mist text-mssn-greenDark' : 'text-mssn-slate'}`}>Existing Member</a>
                <a href="/new" onClick={createRouteHandler('/new')} className={`block px-4 py-2 text-sm hover:bg-mssn-mist ${isActive('/new') ? 'bg-mssn-mist text-mssn-greenDark' : 'text-mssn-slate'}`}>New Member</a>
              </div>
            </div>
            <a href="/contact" onClick={createRouteHandler('/contact')} className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-mssn-slate ring-1 ring-mssn-slate/10 hover:ring-mssn-green/40">Contact Us</a>
          </div>
        </aside>
      </div>
    </header>
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
              <p className="text-xs text-white/70">Strengthening faith, education, and community impact across Lagos.</p>
            </div>
          </div>
          <div className="grid gap-3 text-xs sm:grid-cols-2 sm:gap-4">
            <a href="#support" className="underline decoration-mssn-green/40 underline-offset-4">
              Visit support hub
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

function Layout({ children }) {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const { loading } = useSettings()

  const toggleNav = () => setIsNavOpen((prev) => !prev)
  const closeNav = () => setIsNavOpen(false)

  return (
    <div className="flex min-h-screen flex-col bg-mssn-mist text-mssn-slate">
      <Header isNavOpen={isNavOpen} onToggleNav={toggleNav} onCloseNav={closeNav} />
      <main className="flex-1">{children}</main>
      <Footer />
      {loading && <FullPageLoader />}
      <PwaInstallPrompt />
      <WhatsAppWidget />
    </div>
  )
}

export default Layout
