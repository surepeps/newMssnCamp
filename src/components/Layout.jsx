import { useMemo, useState } from 'react'

const logoUrl = 'https://camp.mssnlagos.net/assets/thumbnail_large.png'

function Header({ isNavOpen, onToggleNav, onCloseNav }) {
  return (
    <header className="sticky top-0 z-40 border-b border-mssn-slate/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <a
          href="/"
          className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-mssn-slate shadow-soft ring-1 ring-mssn-green/20 transition hover:bg-white"
          onClick={onCloseNav}
        >
          <img src={logoUrl} alt="MSSN Lagos" className="h-12 w-12 rounded-3xl object-cover shadow-soft ring-1 ring-white/40" />
          <span className="flex flex-col text-left">
            <span className="text-xs uppercase tracking-[0.18em] text-mssn-greenDark">MSSN Lagos</span>
            <span className="text-base">Camp Experience Portal</span>
          </span>
        </a>
        <nav className="hidden items-center gap-2 text-sm font-semibold lg:flex">
          <a href="/" className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark">Home</a>
          <a href="#quick-actions" className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark">Re-print Slip</a>
          <a href="https://mssnlagos.org/camp/register/returning" target="_blank" rel="noreferrer" className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark">Check MSSN ID</a>
          <div className="group relative">
            <button type="button" className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark">Registration ▾</button>
            <div className="invisible absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-mssn-slate/10 bg-white p-2 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100">
              <a href="https://mssnlagos.org/camp/register/returning" target="_blank" rel="noreferrer" className="block rounded-xl px-3 py-2 text-sm text-mssn-slate hover:bg-mssn-mist">Existing Member</a>
              <a href="https://mssnlagos.org/camp/register/new" target="_blank" rel="noreferrer" className="block rounded-xl px-3 py-2 text-sm text-mssn-slate hover:bg-mssn-mist">New Member</a>
            </div>
          </div>
          <a href="mailto:camp@mssnlagos.org" className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark">Contact Us</a>
          <a href="#ads" className="rounded-full px-3 py-2 text-mssn-slate transition hover:bg-mssn-green/10 hover:text-mssn-greenDark">Advertise With Us</a>
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
          isNavOpen ? 'max-h-[720px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 pb-6">
          <a href="/" onClick={onCloseNav} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-mssn-slate shadow-sm ring-1 ring-mssn-slate/10">Home</a>
          <a href="#quick-actions" onClick={onCloseNav} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-mssn-slate shadow-sm ring-1 ring-mssn-slate/10">Re-print Slip</a>
          <a href="https://mssnlagos.org/camp/register/returning" target="_blank" rel="noreferrer" onClick={onCloseNav} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-mssn-slate shadow-sm ring-1 ring-mssn-slate/10">Check MSSN ID</a>
          <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-mssn-slate/10">
            <div className="px-3 py-2 text-sm font-semibold text-mssn-slate">Registration</div>
            <a href="https://mssnlagos.org/camp/register/returning" target="_blank" rel="noreferrer" onClick={onCloseNav} className="block rounded-xl px-3 py-2 text-sm text-mssn-slate hover:bg-mssn-mist">Existing Member</a>
            <a href="https://mssnlagos.org/camp/register/new" target="_blank" rel="noreferrer" onClick={onCloseNav} className="block rounded-xl px-3 py-2 text-sm text-mssn-slate hover:bg-mssn-mist">New Member</a>
          </div>
          <a href="mailto:camp@mssnlagos.org" onClick={onCloseNav} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-mssn-slate shadow-sm ring-1 ring-mssn-slate/10">Contact Us</a>
          <a href="#ads" onClick={onCloseNav} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-mssn-slate shadow-sm ring-1 ring-mssn-slate/10">Advertise With Us</a>
        </div>
      </nav>
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
            <a href="#ads" className="underline decoration-mssn-green/40 underline-offset-4">
              Explore sponsor offers
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

  const toggleNav = () => setIsNavOpen((prev) => !prev)
  const closeNav = () => setIsNavOpen(false)

  return (
    <div className="flex min-h-screen flex-col bg-mssn-mist text-mssn-slate">
      <Header isNavOpen={isNavOpen} onToggleNav={toggleNav} onCloseNav={closeNav} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
