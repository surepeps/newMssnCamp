import { useEffect, useMemo, useState } from 'react'
import { validatePayment, clearPendingPayment } from '../services/registrationApi.js'
import { navigate } from '../utils/navigation.js'
import { useSettings } from '../context/SettingsContext.jsx'

const logoUrl = 'https://camp.mssnlagos.net/assets/thumbnail_large.png'

const titleCase = (input) => {
  if (typeof input !== 'string') return input
  return input
    .toLowerCase()
    .split(/\s|_/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const buildSummaryItems = (delegate, fallbackPaymentRef) => {
  if (!delegate) return []
  const items = []
  const fullName = [delegate.surname, delegate.firstname, delegate.othername].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  if (fullName) items.push({ label: 'Full name', value: fullName })
  if (delegate.mssn_id || delegate.mssnId) items.push({ label: 'MSSN ID', value: delegate.mssn_id || delegate.mssnId })
  if (delegate.pin) items.push({ label: 'PIN', value: delegate.pin })
  const paymentReference = delegate.payment_reference || fallbackPaymentRef
  if (paymentReference) items.push({ label: 'Payment reference', value: paymentReference })
  if (delegate.payment_status) items.push({ label: 'Payment status', value: titleCase(delegate.payment_status) })
  const category = delegate.camp_category || delegate.pin_category || delegate.pin_cat
  if (category) items.push({ label: 'Camp category', value: titleCase(category) })
  if (typeof delegate.camp_attendance === 'number') {
    items.push({ label: 'Times attended camp', value: String(delegate.camp_attendance) })
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

export default function PaymentValidation() {
  const params = new URLSearchParams(window.location.search)
  const reference =
    params.get('reference') ||
    params.get('paymentRef') ||
    params.get('payment_reference') ||
    params.get('ref') ||
    params.get('tx') ||
    ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [delegate, setDelegate] = useState(null)
  const [transaction, setTransaction] = useState(null)
  const { settings } = useSettings()
  const camp = settings?.current_camp

  useEffect(() => {
    const validate = async () => {
      setLoading(true)
      setError('')
      try {
        if (!reference) {
          setError('Missing payment reference')
          return
        }
        const res = await validatePayment(reference)
        const data = res?.data || {}
        const del = data.delegate || null
        const tx = data.transaction || null
        const success = Boolean(res?.success && (del || (tx && (tx.status === 'Success' || tx.status === 'SUCCESS'))))
        const isFailed = Boolean(tx && typeof tx.status === 'string' && tx.status.toUpperCase() === 'FAILED')
        if (success) {
          setDelegate(del)
          setTransaction(tx)
          clearPendingPayment()
        } else if (isFailed) {
          setDelegate(del)
          setTransaction(tx)
          clearPendingPayment()
        } else if (del || tx) {
          setDelegate(del)
          setTransaction(tx)
        } else {
          setError(res?.message || data?.message || 'Payment could not be validated.')
        }
      } catch (err) {
        setError(err?.message || 'Network error')
      } finally {
        setLoading(false)
      }
    }
    validate()
  }, [reference])

  const summaryItems = useMemo(() => buildSummaryItems(delegate, reference), [delegate, reference])
  const detailItems = useMemo(() => buildDetailItems(delegate), [delegate])

  const txAmount = useMemo(() => {
    const amt = transaction?.amount
    if (amt == null) return null
    const value = Number(amt)
    return Number.isFinite(value) ? `₦${value.toFixed(2)}` : String(amt)
  }, [transaction])

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="bg-radial-glow/40 rounded-3xl">
          <div className="flex flex-col gap-4 px-6 pt-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">Payment</span>
              <h1 className="mt-2 text-3xl font-semibold text-mssn-slate">Payment validation</h1>
              <p className="mt-2 text-sm text-mssn-slate/70">We validate your payment and retrieve your registration details for printing.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="no-print inline-flex items-center text-sm font-semibold text-mssn-greenDark transition hover:text-mssn-green"
            >
              Back to home
            </button>
          </div>

          <div className="px-6 pb-8 sm:px-8">
            {loading ? (
              <div className="mt-6 grid place-items-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-mssn-green border-t-transparent" />
                <p className="mt-3 text-sm text-mssn-slate/70">Validating payment…</p>
              </div>
            ) : error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : (transaction || delegate) ? (
              <div className="mt-6 space-y-4">
                <div className="no-print rounded-2xl border border-mssn-green/30 bg-mssn-green/5 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h2 className="text-base font-semibold uppercase tracking-[0.22em] text-mssn-green">{(transaction?.status || delegate?.payment_status) ? 'Payment validated' : 'Payment result'}</h2>
                      <p className="text-sm text-mssn-slate/70">{transaction?.reference || delegate?.payment_reference || reference}</p>
                    </div>
                    <div className="text-right text-sm">
                      {txAmount ? <div className="font-semibold text-mssn-slate">{txAmount}</div> : null}
                      {transaction?.gateway ? <div className="text-mssn-slate/70">{String(transaction.gateway).toUpperCase()}</div> : null}
                    </div>
                  </div>
                </div>

                <div className="no-print flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center rounded-full border border-mssn-green/40 px-4 py-2 text-sm font-semibold text-mssn-greenDark transition hover:bg-mssn-green/10"
                  >
                    Download PDF
                  </button>
                  {delegate?.mssn_id || delegate?.payment_reference ? (
                    <button
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams()
                        if (delegate?.mssn_id) params.set('mssnId', String(delegate.mssn_id))
                        if (delegate?.payment_reference) params.set('paymentRef', String(delegate.payment_reference))
                        navigate(`/reprint-slip${params.toString() ? `?${params.toString()}` : ''}`)
                      }}
                      className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-mssn-greenDark"
                    >
                      Re‑print Slip
                    </button>
                  ) : null}
                </div>

                <div id="slip-print-area" className="mx-auto w-full rounded-3xl bg-white ring-1 ring-mssn-slate/10">
                  <div className="border-b border-mssn-slate/10 p-6 sm:p-8">
                    <div className="flex items-start gap-3 sm:items-center">
                      <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white ring-1 ring-mssn-slate/10 sm:h-14 sm:w-14">
                        <img src={logoUrl} alt="MSSN Lagos" className="absolute inset-0 h-full w-full object-contain p-1" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">{camp?.camp_code || 'CAMP'}</span>
                        <h3 className="text-xl font-semibold text-mssn-slate">{camp?.camp_title || 'Camp MSSN Lagos'}</h3>
                        {camp?.camp_theme ? <p className="text-sm text-mssn-slate/70">{camp.camp_theme}</p> : null}
                        {camp?.camp_date ? <p className="text-sm text-mssn-slate/70">{camp.camp_date}</p> : null}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-mssn-slate/10 bg-mssn-mist/70 px-4 py-3">
                        <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Payment reference</dt>
                        <dd className="mt-1 text-sm font-semibold text-mssn-slate">{delegate?.payment_reference || transaction?.reference || reference}</dd>
                      </div>
                      {(transaction?.status || delegate?.payment_status) ? (
                        <div className="rounded-xl border border-mssn-green/20 bg-mssn-green/10 px-4 py-3">
                          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Status</dt>
                          <dd className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-mssn-greenDark">
                            <span className="rounded-full border border-mssn-green/30 bg-white/60 px-2 py-0.5">{(transaction?.status || delegate?.payment_status)}</span>
                          </dd>
                        </div>
                      ) : null}
                      {(transaction?.amount || transaction?.gateway) ? (
                        <div className="rounded-xl border border-mssn-slate/10 bg-white px-4 py-3">
                          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Summary</dt>
                          <dd className="mt-1 text-sm font-semibold text-mssn-slate">
                            {txAmount ? <span>{txAmount}</span> : null}
                            {transaction?.gateway ? <span className="ml-2 text-mssn-slate/70">{String(transaction.gateway).toUpperCase()}</span> : null}
                          </dd>
                        </div>
                      ) : null}
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

                  {(transaction?.reference || transaction?.gateway || transaction?.amount || transaction?.transaction_created_at) ? (
                    <div className="border-t border-mssn-slate/10">
                      <div className="p-6 sm:p-8">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-mssn-green">Transaction details</h3>
                        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                          {transaction?.reference ? (
                            <div className="rounded-2xl border border-mssn-slate/10 bg-white px-4 py-3">
                              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Reference</dt>
                              <dd className="mt-1 text-sm font-semibold text-mssn-slate">{transaction.reference}</dd>
                            </div>
                          ) : null}
                          {transaction?.gateway ? (
                            <div className="rounded-2xl border border-mssn-slate/10 bg-white px-4 py-3">
                              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Gateway</dt>
                              <dd className="mt-1 text-sm font-semibold text-mssn-slate">{String(transaction.gateway).toUpperCase()}</dd>
                            </div>
                          ) : null}
                          {txAmount ? (
                            <div className="rounded-2xl border border-mssn-slate/10 bg-white px-4 py-3">
                              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Amount</dt>
                              <dd className="mt-1 text-sm font-semibold text-mssn-slate">{txAmount}</dd>
                            </div>
                          ) : null}
                          {transaction?.transaction_created_at ? (
                            <div className="rounded-2xl border border-mssn-slate/10 bg-white px-4 py-3">
                              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Date</dt>
                              <dd className="mt-1 text-sm font-semibold text-mssn-slate">{new Date(Number(transaction.transaction_created_at)).toLocaleString('en-NG')}</dd>
                            </div>
                          ) : null}
                        </dl>
                      </div>
                    </div>
                  ) : null}

                  {detailItems.length ? (
                    <div className="border-t border-mssn-slate/10 print-hide">
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
            ) : (
              <div className="mt-6 text-sm text-mssn-slate/70">Provide a payment reference in the link to validate payment.</div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/30">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-soft">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-mssn-green border-t-transparent" />
            <h3 className="mt-4 text-base font-semibold text-mssn-slate">Processing</h3>
            <p className="mt-1 text-sm text-mssn-slate/70">Validating your payment. Please wait…</p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
