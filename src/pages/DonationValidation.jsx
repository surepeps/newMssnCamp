import { useEffect, useMemo, useState } from 'react'
import { fetchJSON } from '../services/api.js'
import { navigate } from '../utils/navigation.js'

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

function formatAmount(amt) {
  if (amt == null) return null
  const num = Number(amt)
  if (!Number.isFinite(num)) return String(amt)
  return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function parseDate(value) {
  if (!value) return null
  const asNumber = Number(value)
  const d = Number.isFinite(asNumber) && asNumber > 0 ? new Date(asNumber) : new Date(String(value))
  const time = d.getTime()
  if (!Number.isFinite(time) || Number.isNaN(time)) return null
  try {
    return d.toLocaleString('en-NG')
  } catch {
    return d.toString()
  }
}

export default function DonationValidation() {
  const params = new URLSearchParams(window.location.search)
  const reference =
    params.get('reference') ||
    params.get('donation_reference') ||
    params.get('ref') ||
    params.get('tx') ||
    ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [donation, setDonation] = useState(null)
  const [transaction, setTransaction] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const validate = async () => {
      setLoading(true)
      setError('')
      setMessage('')
      setDonation(null)
      setTransaction(null)
      try {
        if (!reference) {
          setError('Missing donation reference')
          return
        }
        const res = await fetchJSON(`/donations/callback?reference=${encodeURIComponent(reference)}`)
        const data = res?.data || {}
        const dn = data.donation || null
        const tx = data.transaction || null
        setMessage(res?.message || '')
        if (dn) setDonation(dn)
        if (tx) setTransaction(tx)
        if (!dn && !tx) {
          setError(res?.message || 'Donation could not be validated.')
        }
      } catch (err) {
        setError(err?.message || 'Network error')
      } finally {
        setLoading(false)
      }
    }
    validate()
  }, [reference])

  const statusLabel = useMemo(() => {
    const s = donation?.payment_status || transaction?.status
    return s ? String(s) : ''
  }, [donation, transaction])

  const txAmount = useMemo(() => formatAmount(transaction?.amount ?? donation?.amount), [transaction, donation])

  const summaryItems = useMemo(() => {
    const items = []
    if (donation?.donor_name) items.push({ label: 'Donor name', value: donation.donor_name })
    if (donation?.donor_email) items.push({ label: 'Email', value: donation.donor_email, href: `mailto:${donation.donor_email}` })
    if (donation?.donation_type) items.push({ label: 'Donation type', value: titleCase(donation.donation_type) })
    if (donation?.donation_code) items.push({ label: 'Donation code', value: donation.donation_code })
    if (donation?.payment_status) items.push({ label: 'Payment status', value: titleCase(donation.payment_status) })
    if (donation?.payment_completed_at) {
      const dt = parseDate(donation.payment_completed_at)
      if (dt) items.push({ label: 'Payment completed at', value: dt })
    }
    return items
  }, [donation])

  const txDetails = useMemo(() => {
    const parts = []
    if (transaction?.reference) parts.push({ label: 'Reference', value: transaction.reference })
    if (transaction?.gateway) parts.push({ label: 'Gateway', value: String(transaction.gateway).toUpperCase() })
    if (txAmount) parts.push({ label: 'Amount', value: txAmount })
    if (transaction?.channel) parts.push({ label: 'Channel', value: String(transaction.channel).toUpperCase() })
    const dt = parseDate(transaction?.transaction_created_at || transaction?.created_at)
    if (dt) parts.push({ label: 'Date', value: dt })
    if (transaction?.transaction_id) parts.push({ label: 'Transaction ID', value: transaction.transaction_id })
    if (transaction?.gateway_reference) parts.push({ label: 'Gateway Ref', value: transaction.gateway_reference })
    return parts
  }, [transaction, txAmount])

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="bg-radial-glow/40 rounded-3xl">
          <div className="flex flex-col gap-4 px-6 pt-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">Donation</span>
              <h1 className="mt-2 text-3xl font-semibold text-mssn-slate">Donation validation</h1>
              <p className="mt-2 text-sm text-mssn-slate/70">We validate your donation and show your receipt details.</p>
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
                <p className="mt-3 text-sm text-mssn-slate/70">Validating donation…</p>
              </div>
            ) : error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : (transaction || donation) ? (
              <div className="mt-6 space-y-4">
                <div className="no-print rounded-2xl border border-mssn-green/30 bg-mssn-green/5 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h2 className="text-base font-semibold uppercase tracking-[0.22em] text-mssn-green">{statusLabel ? 'Donation validated' : 'Donation result'}</h2>
                      <p className="text-sm text-mssn-slate/70">{donation?.donation_reference || transaction?.reference || reference}</p>
                      {message ? <p className="text-xs text-mssn-slate/60">{message}</p> : null}
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
                </div>

                <div id="receipt-print-area" className="mx-auto w-full rounded-3xl bg-white ring-1 ring-mssn-slate/10">
                  <div className="border-b border-mssn-slate/10 p-6 sm:p-8">
                    <div className="flex items-start gap-3 sm:items-center">
                      <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white ring-1 ring-mssn-slate/10 sm:h-14 sm:w-14">
                        <img src={logoUrl} alt="MSSN Lagos" className="absolute inset-0 h-full w-full object-contain p-1" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">MSSN</span>
                        <h3 className="text-xl font-semibold text-mssn-slate">Donation Receipt</h3>
                        {donation?.donor_email ? <p className="text-sm text-mssn-slate/70">{donation.donor_email}</p> : null}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-mssn-slate/10 bg-mssn-mist/70 px-4 py-3">
                        <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Donation reference</dt>
                        <dd className="mt-1 text-sm font-semibold text-mssn-slate">{donation?.donation_reference || transaction?.reference || reference}</dd>
                      </div>
                      {statusLabel ? (
                        <div className="rounded-xl border border-mssn-green/20 bg-mssn-green/10 px-4 py-3">
                          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Status</dt>
                          <dd className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-mssn-greenDark">
                            <span className="rounded-full border border-mssn-green/30 bg-white/60 px-2 py-0.5">{statusLabel}</span>
                          </dd>
                        </div>
                      ) : null}
                      {(transaction?.amount || transaction?.gateway || donation?.amount) ? (
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
                  ) : null}

                  {(transaction?.reference || transaction?.gateway || transaction?.amount || transaction?.transaction_created_at || transaction?.channel) ? (
                    <div className="border-t border-mssn-slate/10">
                      <div className="p-6 sm:p-8">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-mssn-green">Transaction details</h3>
                        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                          {txDetails.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-mssn-slate/10 bg-white px-4 py-3">
                              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">{item.label}</dt>
                              <dd className="mt-1 text-sm font-semibold text-mssn-slate">{item.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  ) : null}

                  <div className="border-t border-mssn-slate/10 p-6 text-xs text-mssn-slate/60 sm:p-8">
                    Thank you for your support. Please keep a copy of this receipt for your records.
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-sm text-mssn-slate/70">Provide a donation reference in the link to validate your donation.</div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/30">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-soft">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-mssn-green border-t-transparent" />
            <h3 className="mt-4 text-base font-semibold text-mssn-slate">Processing</h3>
            <p className="mt-1 text-sm text-mssn-slate/70">Validating your donation. Please wait…</p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
