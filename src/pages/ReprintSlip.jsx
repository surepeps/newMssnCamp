import * as React from 'react'
import { toast } from 'sonner'
import { fetchJSON } from '../services/api.js'
import { navigate } from '../utils/navigation.js'
import { useSettings } from '../context/SettingsContext.jsx'


const formatMssnId = (value) => value.replace(/\s+/g, '').toUpperCase()
const formatPaymentRef = (value) => value.replace(/\s+/g, '').toUpperCase()

const titleCase = (input) => {
  if (typeof input !== 'string') return input
  return input
    .toLowerCase()
    .split(/\s|_/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const buildSummaryItems = (delegate, paymentRef) => {
  if (!delegate) return []
  const items = []
  const fullName = [delegate.surname, delegate.firstname, delegate.othername].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  if (fullName) items.push({ label: 'Full name', value: fullName })
  if (delegate.mssn_id) items.push({ label: 'MSSN ID', value: delegate.mssn_id })
  if (delegate.pin) items.push({ label: 'PIN', value: delegate.pin })
  const paymentReference = delegate.payment_reference || paymentRef
  if (paymentReference) items.push({ label: 'Payment reference', value: paymentReference })
  if (delegate.payment_status) items.push({ label: 'Payment status', value: titleCase(delegate.payment_status) })
  const category = delegate.camp_category || delegate.pin_category
  if (category) items.push({ label: 'Camp category', value: titleCase(category) })
  if (typeof delegate.camp_attendance === 'number') {
    items.push({ label: 'Times attended camp', value: `${delegate.camp_attendance}` })
  }
  if (delegate.serial_no) items.push({ label: 'Serial number', value: delegate.serial_no })
  return items
}

const detailDefinitions = [
  { label: 'Area council', key: 'area_council' },
  { label: 'Branch', key: 'branch' },
  { label: 'School / Institution', key: 'school' },
  { label: 'Course', key: 'course' },
  { label: 'Class level', key: 'class_level' },
  { label: 'Discipline', key: 'discipline' },
  { label: 'Workplace', key: 'workplace' },
  { label: 'Highest qualification', key: 'highest_qualification' },
  { label: 'Age', key: 'date_of_birth' },
  { label: 'Marital status', key: 'marital_status', transform: titleCase },
  { label: 'State of origin', key: 'state_of_origin' },
  { label: 'Next of kin', key: 'next_of_kin' },
  { label: 'Next of kin phone', key: 'next_of_kin_tel', hrefPrefix: 'tel:' },
  { label: 'Phone number', key: 'tel_no', hrefPrefix: 'tel:' },
  { label: 'Email', key: 'email', hrefPrefix: 'mailto:' },
  { label: 'Resident address', key: 'resident_address' },
  { label: 'Ailments', key: 'ailments' },
  { label: 'Date registered', key: 'date_registered' },
  { label: 'Transaction ID', key: 'transaction_id' },
]

const buildDetailItems = (delegate) => {
  if (!delegate) return []
  return detailDefinitions
    .map((definition) => {
      const rawValue = delegate[definition.key]
      if (rawValue == null || rawValue === '') return null
      const value = definition.transform ? definition.transform(rawValue) : rawValue
      const href = definition.hrefPrefix ? `${definition.hrefPrefix}${String(value).trim()}` : null
      return { label: definition.label, value, href }
    })
    .filter(Boolean)
}

export default function ReprintSlip() {
  const [mssnId, setMssnId] = React.useState('')
  const [paymentRef, setPaymentRef] = React.useState('')
  const [delegate, setDelegate] = React.useState(null)
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const mssnFieldRef = React.useRef(null)
  const { settings } = useSettings()
  const camp = settings?.current_camp

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const qM = params.get('mssnId') || ''
      const qR = params.get('paymentRef') || ''
      if (qM) setMssnId(formatMssnId(qM))
      if (qR) setPaymentRef(formatPaymentRef(qR))
      if (qM && qR) {
        // Auto fetch
        ;(async () => {
          setLoading(true)
          setError('')
          try {
            const payload = { mssn_id: formatMssnId(qM), payment_ref: formatPaymentRef(qR) }
            const response = await fetchJSON('/slip/reprint', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (!response?.success || !response?.delegate) {
              const message = response?.message || 'Registration slip not found. Check the details and try again.'
              setError(message)
              setDelegate(null)
            } else {
              setDelegate(response.delegate)
              toast.success('Registration slip found. You can now view and print it.')
            }
          } catch (err) {
            if (err?.name === 'AbortError') setError('Request timed out. Please try again in a moment.')
            else if (err?.message) setError(err.message)
            else setError('Unable to fetch registration slip. Please try again later.')
          } finally {
            setLoading(false)
          }
        })()
      } else {
        mssnFieldRef.current?.focus()
      }
    } catch {
      mssnFieldRef.current?.focus()
    }
  }, [])

  const summaryItems = React.useMemo(() => buildSummaryItems(delegate, paymentRef), [delegate, paymentRef])
  const detailItems = React.useMemo(() => buildDetailItems(delegate), [delegate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formattedMssn = formatMssnId(mssnId)
    const formattedRef = formatPaymentRef(paymentRef)
    if (!formattedMssn || !formattedRef) {
      setError('Enter both MSSN ID and payment reference to continue.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = { mssn_id: formattedMssn, payment_ref: formattedRef }
      const response = await fetchJSON('/slip/reprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response?.success || !response?.delegate) {
        const message = response?.message || 'Registration slip not found. Check the details and try again.'
        setError(message)
        setDelegate(null)
        return
      }
      setDelegate(response.delegate)
      toast.success('Registration slip found. You can now view and print it.')
    } catch (err) {
      if (err?.name === 'AbortError') {
        setError('Request timed out. Please try again in a moment.')
      } else if (err?.message) {
        setError(err.message)
      } else {
        setError('Unable to fetch registration slip. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMssnId('')
    setPaymentRef('')
    setDelegate(null)
    setError('')
    mssnFieldRef.current?.focus()
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white no-print">
        <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="bg-radial-glow/40 rounded-3xl">
          <div className="flex flex-col gap-4 px-6 pt-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">Reprint Slip</span>
              <h1 className="mt-2 text-3xl font-semibold text-mssn-slate">Retrieve your registration slip</h1>
              <p className="mt-2 text-sm text-mssn-slate/70">Provide your MSSN ID and payment reference to reprint your camp registration slip.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center text-sm font-semibold text-mssn-greenDark transition hover:text-mssn-green"
            >
              Back to home
            </button>
          </div>

          <form className="mt-6 space-y-8 px-6 pb-8 sm:px-8" onSubmit={handleSubmit} noValidate>
            <div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-mssn-green">Verification</h2>
                <p className="mt-2 text-sm text-mssn-slate/70">We will verify these details and return the exact registration slip associated with the payment.</p>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="mssnId" className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70">
                      MSSN ID *
                    </label>
                  </div>
                  <input
                    id="mssnId"
                    name="mssnId"
                    type="text"
                    required
                    placeholder="Enter MSSN ID"
                    autoComplete="off"
                    value={mssnId}
                    ref={mssnFieldRef}
                    onChange={(event) => setMssnId(formatMssnId(event.target.value))}
                    className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2 ${
                      error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 focus:border-mssn-green focus:ring-mssn-green/25'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="paymentRef" className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70">
                      Payment reference *
                    </label>
                  </div>
                  <input
                    id="paymentRef"
                    name="paymentRef"
                    type="text"
                    required
                    placeholder="Enter payment reference"
                    autoComplete="off"
                    value={paymentRef}
                    onChange={(event) => setPaymentRef(formatPaymentRef(event.target.value))}
                    className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2 ${
                      error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 focus:border-mssn-green focus:ring-mssn-green/25'
                    }`}
                  />
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center justify-center rounded-2xl px-8 py-3 text-sm font-semibold transition ${
                  loading
                    ? 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60'
                    : 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white hover:from-mssn-greenDark hover:to-mssn-greenDark'
                }`}
              >
                {loading ? 'Fetching slip…' : 'Retrieve slip'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl border border-mssn-slate/20 px-8 py-3 text-sm font-semibold text-mssn-slate transition hover:border-mssn-green/40 hover:text-mssn-greenDark"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => navigate('/new')}
                className="inline-flex items-center justify-center rounded-2xl bg-mssn-green/10 px-8 py-3 text-sm font-semibold text-mssn-greenDark transition hover:bg-mssn-green/20"
              >
                New registration
              </button>
            </div>
          </form>
        </div>
      </div>

      {delegate ? (
        <div className="mt-10 space-y-8">
          <div className="rounded-3xl border border-mssn-green/20 bg-white/95 p-6 shadow-soft no-print">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold uppercase tracking-[0.22em] text-mssn-green">Registration slip</h2>
                <p className="mt-1 text-sm text-mssn-slate/70">Save or download this slip for camp entry verification.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center rounded-full border border-mssn-green/40 px-4 py-2 text-sm font-semibold text-mssn-greenDark transition hover:bg-mssn-green/10"
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/registration')}
                  className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-mssn-greenDark"
                >
                  Check registration status
                </button>
              </div>
            </div>
          </div>

          <div id="slip-print-area" className="mx-auto w-full rounded-3xl bg-white ring-1 ring-mssn-slate/10">
            <div className="border-b border-mssn-slate/10 p-6 sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">{camp?.camp_code || 'CAMP'}</span>
                  <h3 className="text-xl font-semibold text-mssn-slate">{camp?.camp_title || 'Camp MSSN Lagos'}</h3>
                  {camp?.camp_theme ? <p className="text-sm text-mssn-slate/70">{camp.camp_theme}</p> : null}
                  {camp?.camp_date ? <p className="text-sm text-mssn-slate/70">{camp.camp_date}</p> : null}
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                  <div className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Payment reference</div>
                  <div className="mt-1 text-sm font-semibold text-mssn-slate">{delegate.payment_reference || paymentRef}</div>
                </div>
              </div>
            </div>

            {summaryItems.length ? (
              <dl className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">
                {summaryItems.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-mssn-mist/70 px-4 py-3">
                    <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">{item.label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-mssn-slate">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {detailItems.length ? (
              <div className="border-t border-mssn-slate/10">
                <div className="p-6 sm:p-8">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-mssn-green">Additional details</h3>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {detailItems.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-mssn-slate/10 bg-white px-4 py-3">
                        <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">{item.label}</dt>
                        <dd className="mt-1 text-sm font-semibold text-mssn-slate">
                          {item.href ? (
                            <a href={item.href} className="text-mssn-greenDark underline decoration-mssn-green/40 underline-offset-4">{item.value}</a>
                          ) : (
                            <span>{item.value}</span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : null}

            <div className="border-t border-mssn-slate/10 p-6 text-xs text-mssn-slate/60 sm:p-8">
              Please present this slip at the registration desk. Keep a digital or printed copy for your records.
            </div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/30">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-soft">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-mssn-green border-t-transparent" />
            <h3 className="mt-4 text-base font-semibold text-mssn-slate">Processing</h3>
            <p className="mt-1 text-sm text-mssn-slate/70">Fetching your registration slip. Please wait…</p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
