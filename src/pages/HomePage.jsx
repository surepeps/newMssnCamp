import * as React from 'react'
import { navigate, isModifiedEvent } from '../utils/navigation.js'
import { useSettings } from '../context/SettingsContext.jsx'
import PricingDiscounts from '../components/PricingDiscounts.jsx'

const DRAFT_KEY = 'new_member_draft'

const quickActions = [
  {
    id: 'new-member',
    title: 'New Member',
    description: 'Register as a new camper and complete your payment online.',
    href: '/new',
  },
  {
    id: 'existing-member',
    title: 'Existing Member',
    description: 'Verify your MSSN ID, update your information, and confirm your camp attendance.',
    href: '/existing/validate',
  },
  {
    id: 'reprint-slip',
    title: 'Reprint Slip',
    description: 'Reprint your camp registration slip or payment receipt anytime.',
    href: '/reprint-slip',
  },
]


const CATEGORY_LABELS = {
  secondary: 'Secondary',
  undergraduate: 'Undergraduate',
  others: 'Others',
}

function HeroSlider() {
  const { settings } = useSettings()
  const camp = settings?.current_camp
  const campTitle = camp?.camp_title || 'Camp MSSN Lagos'

  return (
    <section id="home" className="relative overflow-hidden bg-mssn-night text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-mssn-night/95 via-mssn-night/75 to-mssn-green/50" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-20 sm:py-24">
        <div className="max-w-3xl">
          <div className="mb-4 h-0.5 w-20 rounded-full bg-white/40" />
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">
          {camp?.camp_code || 'CAMP'}
        </span>
        <h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow-2xl sm:text-5xl lg:text-6xl">{campTitle}</h1>
        {camp?.camp_theme && (
          <p className="max-w-2xl text-lg text-white/95 lg:text-xl drop-shadow-lg">{camp.camp_theme}</p>
        )}
        {camp?.camp_date && (
          <p className="text-sm text-white/90">{camp.camp_date}</p>
        )}
      </div>
    </section>
  )
}

function QuickActionsBar() {
  const [draft, setDraft] = React.useState(null)

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const loadDraftFromStorage = () => {
      try {
        const raw = window.localStorage.getItem(DRAFT_KEY)
        if (!raw) {
          setDraft(null)
          return
        }
        const data = JSON.parse(raw)
        if (data && typeof data === 'object') {
          setDraft(data)
        } else {
          setDraft(null)
        }
      } catch {
        setDraft(null)
      }
    }

    const handleStorage = (event) => {
      if (event?.key && event.key !== DRAFT_KEY) {
        return
      }
      loadDraftFromStorage()
    }

    loadDraftFromStorage()
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const resumeDetails = React.useMemo(() => {
    if (!draft || typeof draft !== 'object') return null
    const category = typeof draft.category === 'string' ? draft.category : null
    const values = draft.values && typeof draft.values === 'object' ? draft.values : {}
    const surname = typeof values.surname === 'string' ? values.surname.trim() : ''
    const firstname = typeof values.firstname === 'string' ? values.firstname.trim() : ''
    const name = `${surname} ${firstname}`.replace(/\s+/g, ' ').trim()
    let updatedAtLabel = null
    if (typeof draft.updatedAt === 'number') {
      const date = new Date(draft.updatedAt)
      if (!Number.isNaN(date.getTime())) {
        updatedAtLabel = date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      }
    }
    return {
      category,
      categoryLabel: category ? CATEGORY_LABELS[category] || category : null,
      name: name || null,
      updatedAtLabel,
    }
  }, [draft])

  const resumeMeta = React.useMemo(() => {
    if (!resumeDetails) return ''
    const parts = []
    if (resumeDetails.name) parts.push(resumeDetails.name)
    if (resumeDetails.categoryLabel) parts.push(resumeDetails.categoryLabel)
    if (resumeDetails.updatedAtLabel) parts.push(`Saved ${resumeDetails.updatedAtLabel}`)
    return parts.join(' • ')
  }, [resumeDetails])

  const handleResumeDraft = () => {
    const targetCategory = resumeDetails?.category
    navigate(targetCategory ? `/new/${targetCategory}` : '/new')
  }

  const handleDeleteDraft = () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(DRAFT_KEY)
      } catch {}
    }
    setDraft(null)
  }

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
      className="relative z-20 mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6"
      aria-label="Quick actions"
    >
      <div className="-mx-4 rounded-4xl bg-white/95 p-6 ring-1 ring-mssn-slate/10 sm:mx-0">
        <div className="grid gap-6 lg:grid-cols-3">
          {resumeDetails ? (
            <div className="flex flex-col gap-4 rounded-3xl border border-mssn-green/30 bg-mssn-green/10 p-6 lg:col-span-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-mssn-green">Saved registration draft</h2>
                  {resumeMeta ? <p className="mt-1 text-xs text-mssn-slate/60">{resumeMeta}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResumeDraft}
                    className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-mssn-greenDark"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteDraft}
                    className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : null}
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


export default function HomePage() {
  return (
    <div>
      <HeroSlider />
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="-mt-20 lg:-mt-26">
          <QuickActionsBar />
        </div>
      </div>

      <PricingDiscounts />

      <section id="ads-placeholder" className="mx-auto mt-10 w-full max-w-6xl px-6">
        <div className="rounded-3xl border border-mssn-slate/10 bg-white p-6">
          <h2 className="text-lg font-semibold text-mssn-slate">Place your ads here</h2>
          <p className="mt-2 text-sm text-mssn-slate/70">Available ad slots — contact our partnerships team to reserve a slot.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-mssn-slate/20 bg-mssn-mist text-center text-mssn-slate/60">
                <div>
                  <div className="text-sm font-semibold">Ad slot</div>
                  <div className="mt-1 text-xs">Place your ad here</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
