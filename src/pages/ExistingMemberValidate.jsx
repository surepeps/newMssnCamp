import { useEffect, useRef, useState } from 'react'
import { navigate } from '../utils/navigation.js'
import StepProgress from '../components/StepProgress.jsx'
import { fetchJSON } from '../services/api.js'
import { toast } from 'sonner'

export default function ExistingMemberValidate() {
  const [mssnId, setMssnId] = useState('')
  const [surname, setSurname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const mssnRef = useRef(null)
  const surnameRef = useRef(null)

  useEffect(() => {
    mssnRef.current?.focus()
  }, [])

  const formatMssn = (val) => val.replace(/\s+/g, '').toUpperCase()
  const formatSurname = (val) => val.replace(/\s{2,}/g, ' ').trim().toUpperCase()

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    setLoading(true)
    setError('')
    const t = toast.loading('Verifying details…')
    try {
      const payload = { mssn_id: formatMssn(mssnId), surname: formatSurname(surname) }
      const res = await fetchJSON('/registration/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res?.success || !res?.delegate?.details) {
        const msg = res?.message || 'Record not found. Check details and try again.'
        setError(msg)
        toast.error(msg)
      } else {
        localStorage.setItem('existing_member_delegate', JSON.stringify(res.delegate))
        toast.success('Record found. Proceed to edit your details.')
        const qs = new URLSearchParams({ mssnId: payload.mssn_id, surname: payload.surname }).toString()
        navigate(`/existing/edit?${qs}`)
      }
    } catch (err) {
      let msg = 'Unable to verify at the moment. Please try again later.'
      if (err?.name === 'AbortError') {
        msg = 'Request timed out. Please check your internet connection and try again.'
      } else if (typeof err?.status === 'number') {
        if (err.status === 400 || err.status === 422) msg = 'Invalid details provided. Please check MSSN ID and Surname.'
        else if (err.status === 404) msg = 'Record not found. Please confirm your details.'
        else if (err.status === 429) msg = 'Too many attempts. Please wait a moment and try again.'
        else if (err.status >= 500) msg = 'Server error. Please try again shortly.'
        else msg = err.message || msg
      } else if (err?.message) {
        msg = err.message
      }
      setError(msg)
    } finally {
      toast.dismiss(t)
      setLoading(false)
    }
  }

  const clearForm = () => {
    setMssnId('')
    setSurname('')
    setError('')
    mssnRef.current?.focus()
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-6">
        <StepProgress steps={["Validate", "Edit", "Pay"]} current={0} />
      </div>

      <div className="rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="bg-radial-glow/40">
          <div className="flex flex-col gap-4 px-6 pt-8 sm:flex-row sm:items-start sm:justify-between sm:px-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">Existing Member</span>
              <h1 className="mt-2 text-3xl font-semibold text-mssn-slate">Validation</h1>
              <p className="mt-2 text-sm text-mssn-slate/70">Enter your MSSN ID and surname to continue.</p>
            </div>
            <a
              href="https://mssnlagos.org/camp/register/returning"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-sm font-semibold text-mssn-greenDark transition hover:text-mssn-green"
            >
              Don’t know your MSSN ID?
            </a>
          </div>

          <form id="validateForm" className="mt-10 space-y-8 px-6 pb-10 sm:px-10" onSubmit={onSubmit} noValidate>
            <div className="rounded-3xl border border-mssn-slate/10 bg-white/90 p-6 sm:p-8">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-mssn-green">Verification</h2>
                <p className="mt-2 text-sm text-mssn-slate/70">We’ll verify your details and take you to the edit page to confirm or update your information before payment.</p>
                {error ? (
                  <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert" aria-live="polite">{error}</div>
                ) : null}
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="mssnId" className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70">MSSN ID *</label>
                  </div>
                  <input
                    id="mssnId"
                    name="mssnId"
                    type="text"
                    required
                    inputMode="text"
                    autoComplete="off"
                    placeholder="ENTER MSSN ID"
                    value={mssnId}
                    ref={mssnRef}
                    onChange={(e) => setMssnId(formatMssn(e.target.value))}
                    className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2 ${error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 focus:border-mssn-green focus:ring-mssn-green/25'}`}
                    aria-invalid={Boolean(error)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="surname" className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70">Surname *</label>
                  </div>
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    required
                    placeholder="ENTER SURNAME"
                    value={surname}
                    ref={surnameRef}
                    onChange={(e) => setSurname(formatSurname(e.target.value))}
                    className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2 ${error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 focus:border-mssn-green focus:ring-mssn-green/25'}`}
                    aria-invalid={Boolean(error)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center justify-center rounded-2xl px-8 py-3 text-sm font-semibold transition ${loading ? 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60' : 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white hover:from-mssn-greenDark hover:to-mssn-greenDark'}`}
              >
                {loading ? 'Verifying…' : 'Validate'}
              </button>
              <button
                type="button"
                onClick={clearForm}
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
                New member? Register here
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-soft">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-mssn-green border-t-transparent" />
            <h3 className="mt-4 text-base font-semibold text-mssn-slate">Processing</h3>
            <p className="mt-1 text-sm text-mssn-slate/70">Verifying your details. Please wait…</p>
          </div>
        </div>
      )}
    </section>
  )
}
