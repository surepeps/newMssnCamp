import * as React from 'react'
import { fetchJSON } from '../services/api.js'
import { navigate } from '../utils/navigation.js'

export default function PaymentValidation() {
  const params = new URLSearchParams(window.location.search)
  const reference = params.get('reference') || params.get('paymentRef') || params.get('ref') || params.get('tx') || ''
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [delegate, setDelegate] = React.useState(null)
  const printRef = React.useRef(null)

  React.useEffect(() => {
    const validate = async () => {
      setLoading(true)
      setError('')
      try {
        if (!reference) {
          setError('Missing payment reference')
          return
        }
        const res = await fetchJSON(`/payment/opay/callback?reference=${encodeURIComponent(reference)}`)
        const data = res?.data || {}
        if (data && (data.delegate || (data.transaction && data.transaction.status === 'Success'))) {
          setDelegate(data.delegate || null)
        } else {
          setError(data.message || 'Payment could not be validated.')
        }
      } catch (err) {
        setError(err?.message || 'Network error')
      } finally {
        setLoading(false)
      }
    }
    validate()
  }, [reference])

  const onPrint = () => {
    const el = printRef.current
    if (!el) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write('<!doctype html><html><head><title>Delegate Record</title>')
    win.document.write('<style>body{font-family:Inter,Arial,Helvetica,sans-serif;padding:24px;color:#0f1d1f;} .card{border:1px solid #e6eef0;padding:16px;border-radius:12px;}</style>')
    win.document.write('</head><body>')
    win.document.write(el.innerHTML)
    win.document.write('</body></html>')
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  return (
    <section className="mx-auto mt-28 w-full max-w-4xl px-6">
      <div className="rounded-3xl border border-mssn-slate/10 bg-white p-6">
        <h1 className="text-2xl font-semibold text-mssn-slate">Payment validation</h1>
        <p className="mt-2 text-sm text-mssn-slate/70">This page validates a payment and retrieves the delegate details on success.</p>

        {loading ? (
          <div className="mt-6 grid place-items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-mssn-green border-t-transparent" />
            <p className="mt-3 text-sm text-mssn-slate/70">Validating payment…</p>
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : delegate ? (
          <div className="mt-6 space-y-4">
            <div ref={printRef} className="card">
              <h2 className="text-lg font-semibold">{[delegate.surname, delegate.firstname, delegate.othername].filter(Boolean).join(' ')}</h2>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div><div className="text-xs text-mssn-slate/60">MSSN ID</div><div className="font-semibold">{delegate.mssn_id || delegate.mssnId || '—'}</div></div>
                <div><div className="text-xs text-mssn-slate/60">Category</div><div className="font-semibold">{delegate.pin_category || delegate.pin_cat || '—'}</div></div>
                <div><div className="text-xs text-mssn-slate/60">Email</div><div className="font-semibold">{delegate.email || '—'}</div></div>
                <div><div className="text-xs text-mssn-slate/60">Phone</div><div className="font-semibold">{delegate.tel_no || delegate.phone || '—'}</div></div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onPrint} className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white">Print record</button>
              <button onClick={() => navigate('/')} className="inline-flex items-center justify-center rounded-full border border-mssn-slate/10 px-4 py-2 text-sm font-semibold text-mssn-slate">Back to home</button>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-sm text-mssn-slate/70">Enter a paymentRef or mssnId in the query string to validate payment.</div>
        )}
      </div>
    </section>
  )
}
