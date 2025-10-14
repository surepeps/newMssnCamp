import * as React from 'react'
import { navigate, isModifiedEvent } from '../utils/navigation.js'
import { useSettings } from '../context/SettingsContext.jsx'
import PricingDiscounts from '../components/PricingDiscounts.jsx'
import { toast } from 'sonner'
import { fetchJSON } from '../services/api.js'
import ProcessingModal from '../components/ProcessingModal.jsx'

const DRAFT_KEY = 'new_member_draft'
const PENDING_PAYMENT_KEY = 'pending_payment'

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
        <svg className="absolute right-0 top-0 h-full w-1/2 opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="hgrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#2ecc71" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#0f1d1f" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#hgrad)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-12 pb-18 sm:pt-16 sm:pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-mssn-green">{camp?.camp_code || 'CAMP'}</span>
              {camp?.camp_date ? (
                <span className="text-xs text-white/80">{camp.camp_date}</span>
              ) : null}
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow-2xl sm:text-5xl lg:text-6xl">{campTitle}</h1>

            {camp?.camp_theme && (
              <p className="mt-4 max-w-2xl text-lg text-white/95 lg:text-xl drop-shadow-lg">{camp.camp_theme}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/new" onClick={(e) => { e.preventDefault(); navigate('/new') }} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-mssn-night shadow-soft transition hover:shadow-glow">Register</a>
              <a href="/check-mssn-id" onClick={(e) => { e.preventDefault(); navigate('/existing/validate') }} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/5">Check MSSN ID</a>
            </div>

            <p className="mt-6 text-sm text-white/80 max-w-xl">Join other students for an engaging and transformative camp experience. Use the quick actions below to get started.</p>
          </div>

          <div className="order-first lg:order-last">
            <div className="hidden lg:block">
              <div className="rounded-3xl bg-white/6 p-6 shadow-soft ring-1 ring-white/6">
                <h3 className="text-sm font-semibold text-white">Camp highlights</h3>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  <li>• Inspiring talks and workshops</li>
                  <li>• Community service and bonding</li>
                  <li>• Sports, arts, and skill-building</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 lg:hidden">
              <div className="rounded-2xl bg-white/6 px-4 py-3 text-sm text-white/90">{camp?.camp_theme || 'Join us for an unforgettable experience'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function QuickActionsBar() {
  const [draft, setDraft] = React.useState(null)
  const [pending, setPending] = React.useState(null)

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const loadDraftFromStorage = () => {
      try {
        const raw = window.localStorage.getItem(DRAFT_KEY)
        if (raw) {
          const data = JSON.parse(raw)
          if (data && typeof data === 'object') {
            setDraft(data)
          } else {
            setDraft(null)
          }
        } else {
          setDraft(null)
        }
      } catch {
        setDraft(null)
      }
      try {
        const pRaw = window.localStorage.getItem(PENDING_PAYMENT_KEY)
        if (pRaw) {
          const pData = JSON.parse(pRaw)
          if (pData && typeof pData === 'object') {
            setPending(pData)
          } else {
            setPending(null)
          }
        } else {
          setPending(null)
        }
      } catch {
        setPending(null)
      }
    }

    const handleStorage = (event) => {
      if (event?.key && event.key !== DRAFT_KEY && event.key !== PENDING_PAYMENT_KEY) {
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

  const pendingDetails = React.useMemo(() => {
    if (!pending || typeof pending !== 'object') return null
    const category = typeof pending.category === 'string' ? pending.category : null
    const categoryLabel = category ? CATEGORY_LABELS[category] || category : null
    const mssnId = typeof pending.mssnId === 'string' ? pending.mssnId : null
    const paymentRef = typeof pending.paymentRef === 'string' ? pending.paymentRef : null
    let savedAtLabel = null
    if (typeof pending.savedAt === 'number') {
      const date = new Date(pending.savedAt)
      if (!Number.isNaN(date.getTime())) {
        savedAtLabel = date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      }
    }
    return { categoryLabel, mssnId, paymentRef, savedAtLabel }
  }, [pending])

  const pendingMeta = React.useMemo(() => {
    if (!pendingDetails) return ''
    const parts = []
    if (pendingDetails.mssnId) parts.push(`MSSN ID: ${pendingDetails.mssnId}`)
    if (pendingDetails.categoryLabel) parts.push(pendingDetails.categoryLabel)
    if (pendingDetails.paymentRef) parts.push(`Ref: ${pendingDetails.paymentRef}`)
    if (pendingDetails.savedAtLabel) parts.push(`Saved ${pendingDetails.savedAtLabel}`)
    return parts.join(' • ')
  }, [pendingDetails])

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

  const handleResumePending = () => {
    const url = pending?.redirect_url
    if (url) window.location.href = url
  }

  const handleDeletePending = () => {
    try {
      window.localStorage.removeItem(PENDING_PAYMENT_KEY)
    } catch {}
    setPending(null)
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
          {pendingDetails ? (
            <div className="flex flex-col gap-4 rounded-3xl border border-mssn-green/30 bg-mssn-green/10 p-6 lg:col-span-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-mssn-green">Pending payment</h2>
                  {pendingMeta ? <p className="mt-1 text-xs text-mssn-slate/60">{pendingMeta}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResumePending}
                    className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-mssn-greenDark"
                  >
                    Pay now
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePending}
                    className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : null}
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
  const [showAdModal, setShowAdModal] = React.useState(false)
  const [activeAdSlot, setActiveAdSlot] = React.useState(null)

  const [selectedAmount, setSelectedAmount] = React.useState(null)
  const [customAmount, setCustomAmount] = React.useState('')
  const [frequency, setFrequency] = React.useState('one-time')

  const [showDonateModal, setShowDonateModal] = React.useState(false)
  const [donating, setDonating] = React.useState(false)

  const [donorName, setDonorName] = React.useState('')
  const [donorEmail, setDonorEmail] = React.useState('')
  const [donorPhone, setDonorPhone] = React.useState('')
  const [donorMessage, setDonorMessage] = React.useState('')
  const [isAnonymous, setIsAnonymous] = React.useState(false)

  const openAdModal = (slot) => {
    setActiveAdSlot(slot)
    setShowAdModal(true)
  }

  const formatNGN = (v) => `₦${Number(v).toLocaleString()}`

  const openDonateModal = () => {
    const amt = Number(selectedAmount || customAmount || 0)
    if (!amt || Number.isNaN(amt) || amt <= 0) {
      toast.error('Please select or enter a donation amount before continuing')
      return
    }
    if (frequency === 'monthly') {
      toast.error('Monthly donations are temporarily disabled. Please choose one‑time.')
      return
    }
    setShowDonateModal(true)
  }

  const submitDonation = async () => {
    const amt = Number(selectedAmount || customAmount || 0)
    if (!donorEmail || !amt) {
      toast.error('Please provide a valid email and amount')
      return
    }
    const payload = {
      donor_name: donorName || '',
      donor_email: donorEmail,
      donor_phone: donorPhone || null,
      donation_type: frequency,
      amount: Number(amt),
      message: donorMessage || null,
      is_anonymous: Boolean(isAnonymous),
    }
    setDonating(true)
    try {
      const res = await fetchJSON('/donation/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setDonating(false)
      setShowDonateModal(false)
      toast.success(res.message || 'Donation created successfully. Proceed to payment.')
      const paymentUrl = res?.data?.payment_url
      if (paymentUrl) {
        window.open(paymentUrl, '_blank')
      }
      // reset fields
      setSelectedAmount(null)
      setCustomAmount('')
      setDonorName('')
      setDonorEmail('')
      setDonorPhone('')
      setDonorMessage('')
      setIsAnonymous(false)
    } catch (e) {
      setDonating(false)
      toast.error(e?.message || 'Unable to initiate donation')
    }
  }

  return (
    <div>
      <HeroSlider />
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="-mt-20 lg:-mt-20">
          <QuickActionsBar />
        </div>
      </div>

      <PricingDiscounts />

      <section id="ads-placeholder" className="mx-auto mt-10 w-full max-w-6xl px-6">
        <div className="rounded-3xl border border-mssn-slate/10 bg-white p-6">
          <h2 className="text-lg font-semibold text-mssn-slate">Place your ads here</h2>
          <p className="mt-2 text-sm text-mssn-slate/70">Available ad slots — tap a slot for instructions on how to place ads.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => openAdModal(slot)}
                className="group flex h-40 w-full items-center justify-center rounded-2xl border border-dashed border-mssn-slate/20 bg-mssn-mist text-center text-mssn-slate/60 hover:border-mssn-green/40"
              >
                <div>
                  <div className="text-sm font-semibold">Ad slot {slot}</div>
                  <div className="mt-1 text-xs">Place your ad here</div>
                  <div className="mt-2 text-xxs text-mssn-slate/50">Tap for instructions</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {showAdModal ? (
        <div className="fixed inset-0 z-[1200] grid place-items-center" role="dialog" aria-modal="true" aria-labelledby="ad-modal-title">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdModal(false)} />
          <div className="relative z-10 mx-4 w-full max-w-3xl rounded-3xl border border-mssn-slate/10 bg-white p-6 shadow-glow">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h3 id="ad-modal-title" className="text-lg font-semibold text-mssn-slate">How to place an ad — Slot {activeAdSlot}</h3>
                <p className="mt-3 text-sm text-mssn-slate/70">Thank you for your interest in advertising with MSSN Lagos. Below are the simple steps to reserve an ad slot and submit your creative.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold text-mssn-slate">Steps to reserve</h4>
                    <ol className="mt-2 list-inside list-decimal text-sm text-mssn-slate/70">
                      <li>Contact our partnerships team with the <strong>slot number</strong>, desired dates, and campaign brief.</li>
                      <li>Confirm availability and payment options.</li>
                      <li>Send your creative assets and final instructions at least 48 hours before start date.</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-mssn-slate">Creative requirements</h4>
                    <ul className="mt-2 list-inside list-disc text-sm text-mssn-slate/70">
                      <li>Recommended size: <strong>1200×600px</strong> (1:0.5)</li>
                      <li>File types: <strong>PNG, JPG</strong></li>
                      <li>Max file size: <strong>200 KB</strong></li>
                      <li>Include a clear call-to-action and tracking link (optional)</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 text-sm text-mssn-slate/70">If you need design help, we can provide a template or assist for a fee. Contact us with your requirements and we'll respond with a quote.</div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a href="mailto:partners@mssnlagos.org" className="inline-flex items-center gap-2 rounded-full border border-mssn-slate/10 px-4 py-2 text-sm font-semibold text-mssn-slate hover:bg-mssn-mist">Email partnerships</a>
                  <button
                    type="button"
                    onClick={() => {
                      const subject = `Ad slot ${activeAdSlot} inquiry`
                      const body = `Hello,%0A%0AI would like to enquire about reserving ad slot ${activeAdSlot}.%0A%0ADesired dates:%0ACampaign brief:%0A%0ARegards,`;
                      window.location.href = `mailto:partners@mssnlagos.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white hover:bg-mssn-greenDark"
                  >
                    Request quote
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // copy quick instructions to clipboard
                      try {
                        const txt = `Slot ${activeAdSlot} - specs: 1200x600px PNG/JPG up to 200KB. Contact partners@mssnlagos.org to reserve.`
                        navigator.clipboard.writeText(txt)
                        toast.success('Ad brief copied to clipboard')
                      } catch (e) {
                        toast.error('Unable to copy to clipboard')
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-mssn-slate/10 px-4 py-2 text-sm font-semibold text-mssn-slate hover:bg-mssn-mist"
                  >
                    Copy brief
                  </button>
                </div>

              </div>

              <div className="w-40 flex-shrink-0">
                <div className="rounded-2xl bg-mssn-mist p-3 text-center">
                  <div className="text-xs font-semibold text-mssn-slate">Preview</div>
                  <div className="mt-3 h-24 w-full overflow-hidden rounded-lg bg-white shadow-inner">
                    <img alt="Ad sample" src="https://via.placeholder.com/1200x600.png?text=Ad+preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-3 text-xs text-mssn-slate/70">1200×600px • PNG/JPG • ≤200KB</div>
                </div>

                <div className="mt-4 text-center">
                  <button type="button" onClick={() => setShowAdModal(false)} className="text-sm font-semibold text-mssn-slate/80 underline">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section id="donate" className="mx-auto mt-8 w-full max-w-6xl px-6">
        <div className="rounded-3xl border border-mssn-slate/10 bg-white p-6">
          <div className="sm:flex sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-mssn-slate">Support our cause</h2>
              <p className="mt-2 text-sm text-mssn-slate/70">Your contribution helps fund scholarships, materials, and outreach. Pick an amount, choose one‑time or monthly, or enter a custom amount.</p>

              <div className="mt-4 flex items-center gap-3" role="radiogroup" aria-label="Donation frequency">
                <button type="button" onClick={() => setFrequency('one-time')} aria-pressed={frequency === 'one-time'} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${frequency === 'one-time' ? 'bg-mssn-green text-white' : 'border border-mssn-slate/10 text-mssn-slate'}`}>One‑time</button>
                <button type="button" disabled aria-pressed={false} className={`rounded-full px-4 py-2 text-sm font-semibold transition opacity-50 cursor-not-allowed border border-mssn-slate/10 text-mssn-slate`}>Monthly (disabled)</button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[1000,2000,5000,10000,20000,50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setSelectedAmount(amt); setCustomAmount('') }}
                    aria-pressed={selectedAmount === amt}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${selectedAmount === amt ? 'bg-mssn-green text-white' : 'border border-mssn-slate/10 text-mssn-slate bg-white'}`}
                    aria-label={`Donate ${amt} naira`}
                  >
                    <span className="text-sm">{formatNGN(amt)}</span>
                    <span className="text-xs text-mssn-slate/60">{frequency === 'monthly' ? 'per month' : ''}</span>
                  </button>
                ))}
              </div>

            </div>

            <div className="mt-6 sm:mt-0 sm:ml-6 sm:w-80">
              <div className="rounded-2xl border border-mssn-slate/10 bg-mssn-mist p-4">
                <label htmlFor="custom-amount" className="block text-sm font-medium text-mssn-slate/80">Custom amount (NGN)</label>
                <div className="mt-2 flex items-center gap-2">
                  <input id="custom-amount" type="number" min="0" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null) }} placeholder="e.g. 7500" className="w-full rounded-xl border border-mssn-slate/10 px-4 py-2 text-sm" />
                </div>

                <div className="mt-4 text-sm text-mssn-slate/70">Summary:</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm font-medium text-mssn-slate">Amount</div>
                  <div className="text-sm font-semibold text-mssn-slate">{(selectedAmount || customAmount) ? formatNGN(selectedAmount || customAmount) : '—'}</div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm font-medium text-mssn-slate">Frequency</div>
                  <div className="text-sm text-mssn-slate">{frequency === 'monthly' ? 'Monthly' : 'One‑time'}</div>
                </div>

                <div className="mt-4 text-right">
                  <button type="button" onClick={openDonateModal} className="inline-flex items-center gap-2 rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-mssn-greenDark">Donate now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* donate modal and processing */}
      {showDonateModal ? (
        <div className="fixed inset-0 z-[1201] grid place-items-center" role="dialog" aria-modal="true" aria-labelledby="donate-modal-title">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDonateModal(false)} />
          <div className="relative z-10 mx-4 w-full max-w-3xl rounded-3xl border border-mssn-slate/10 bg-white p-6 shadow-glow">
            <div className="flex items-start justify-between">
              <div>
                <h3 id="donate-modal-title" className="text-lg font-semibold text-mssn-slate">Complete donation</h3>
                <p className="mt-1 text-sm text-mssn-slate/70">Confirm your donation details and proceed to payment. We will redirect you to the payment provider after creating the donation.</p>
              </div>
              <div>
                <button type="button" onClick={() => setShowDonateModal(false)} className="text-sm text-mssn-slate/70">✕</button>
              </div>
            </div>

            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="h-4 w-4" />
                  <div>
                    <div className="font-semibold text-mssn-slate">Donate anonymously</div>
                    <div className="text-xs text-mssn-slate/70">If enabled, your name will not be shared publicly.</div>
                  </div>
                </label>

                <div className="mt-4">
                  <label className="text-sm text-mssn-slate">Full name {isAnonymous ? <span className="text-xs text-mssn-slate/50">(optional when anonymous)</span> : <span className="text-xs text-mssn-green">(can be MSSN ID)</span>}</label>
                  <input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="e.g. Hassan Tijani" disabled={isAnonymous} className={`w-full mt-2 rounded-xl border px-4 py-2 text-sm ${isAnonymous ? 'border-mssn-slate/20 bg-mssn-mist text-mssn-slate/50' : 'border-mssn-slate/10 bg-white'}`} />
                </div>

                <div className="mt-3">
                  <label className="text-sm text-mssn-slate">Email (required)</label>
                  <input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="you@example.com" className="w-full mt-2 rounded-xl border border-mssn-slate/10 px-4 py-2 text-sm" />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-mssn-slate">Phone (optional)</label>
                    <input type="tel" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} placeholder="+2348123456789" className="w-full mt-2 rounded-xl border border-mssn-slate/10 px-4 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-mssn-slate">Message (optional)</label>
                    <input type="text" value={donorMessage} onChange={(e) => setDonorMessage(e.target.value)} placeholder="Keep up the great work!" className="w-full mt-2 rounded-xl border border-mssn-slate/10 px-4 py-2 text-sm" />
                  </div>
                </div>

              </div>

              <div>
                <div className="rounded-2xl border border-mssn-slate/10 bg-mssn-mist p-4">
                  <div className="text-sm font-semibold text-mssn-slate">Donation summary</div>
                  <div className="mt-3 text-sm text-mssn-slate/70">Amount</div>
                  <div className="mt-1 text-2xl font-semibold text-mssn-night">{(selectedAmount || customAmount) ? formatNGN(selectedAmount || customAmount) : '—'}</div>

                  <div className="mt-4 text-sm text-mssn-slate/70">Type</div>
                  <div className="mt-1 text-sm font-medium text-mssn-slate">{frequency === 'monthly' ? 'Monthly' : 'One‑time'}</div>

                  <div className="mt-4 text-sm text-mssn-slate/70">Donor</div>
                  <div className="mt-1 text-sm font-medium text-mssn-slate">{isAnonymous ? 'Anonymous' : (donorName || 'Provided at checkout')}</div>

                  <div className="mt-6 flex flex-col gap-3">
                    <button type="button" onClick={submitDonation} disabled={donating} className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white ${donating ? 'bg-mssn-slate/50 cursor-not-allowed' : 'bg-mssn-green hover:bg-mssn-greenDark'}`}>
                      {donating ? 'Processing…' : 'Donate & Pay'}
                    </button>

                    <button type="button" onClick={() => setShowDonateModal(false)} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold border border-mssn-slate/10 text-mssn-slate bg-white">Cancel</button>

                    <div className="mt-2 text-xs text-mssn-slate/70">By donating you agree to our terms. We will redirect you to a secure payment provider.</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : null}

      <ProcessingModal visible={donating} title="Processing donation…" subtitle="Creating donation and redirecting to payment provider." />

    </div>
  )
}
