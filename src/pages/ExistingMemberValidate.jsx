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

      <div className="grid gap-6 lg:grid-cols-2">
        <aside className="order-2 lg:order-1">
          <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white">
            <div className="h-1 w-full bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
            <div className="p-6 sm:p-8">
              <h1 className="text-2xl font-semibold">Verify your membership</h1>
              <p className="mt-2 text-sm text-mssn-slate/70">
                Enter your MSSN ID and Surname to fetch your record, then review and update your details before payment.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-mssn-slate/80">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-mssn-green/10 text-mssn-greenDark">✓</span>
                  Faster check-in at camp
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-mssn-green/10 text-mssn-greenDark">✓</span>
                  Keep your contact and emergency info up to date
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-mssn-green/10 text-mssn-greenDark">✓</span>
                  Pay securely after confirming details
                </li>
              </ul>
              <div className="mt-6 rounded-2xl border border-mssn-slate/10 bg-mssn-mist/60 p-4 text-xs text-mssn-slate/80">
                We’ll verify your details and take you to the edit page to confirm or update your information before payment.
              </div>
              <div className="mt-6 grid gap-3 text-sm">
                <a
                  href="https://mssnlagos.org/camp/register/returning"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full border border-mssn-slate/20 bg-white px-4 py-2 font-semibold text-mssn-slate transition hover:border-mssn-green/40 hover:text-mssn-greenDark sm:w-auto"
                >
                  Don’t know your MSSN ID? Check here
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/new')}
                  className="inline-flex w-full items-center justify-center rounded-full bg-mssn-green/10 px-4 py-2 text-sm font-semibold text-mssn-greenDark transition hover:bg-mssn-green/20 sm:w-auto"
                >
                  New member? Register here
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="order-1 lg:order-2">
          <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white">
            <div className="h-1 w-full bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
            <div className="p-6 sm:p-8">
              <form id="validateForm" className="grid gap-5" onSubmit={onSubmit} noValidate>
                <h2 className="text-lg font-semibold">Existing Member Validation</h2>
                <p className="-mt-1 text-sm text-mssn-slate/70">Enter your MSSN ID and Surname to continue.</p>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</div>
                ) : null}

                <div>
                  <label htmlFor="mssnId" className="block text-sm font-semibold text-mssn-slate">MSSN ID</label>
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
                    className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3 text-mssn-slate outline-none ring-2 ring-transparent focus:ring-mssn-green/30"
                    aria-invalid={Boolean(error)}
                  />
                </div>

                <div>
                  <label htmlFor="surname" className="block text-sm font-semibold text-mssn-slate">Surname</label>
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    required
                    placeholder="ENTER SURNAME"
                    value={surname}
                    ref={surnameRef}
                    onChange={(e) => setSurname(formatSurname(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3 text-mssn-slate outline-none ring-2 ring-transparent focus:ring-mssn-green/30"
                    aria-invalid={Boolean(error)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                      loading
                        ? 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60'
                        : 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white hover:translate-y-[-2px]'
                    }`}
                  >
                    {loading ? 'Verifying…' : 'Validate'}
                  </button>
                  <button
                    type="button"
                    onClick={clearForm}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-full border border-mssn-slate/20 bg-white px-5 py-3 text-sm font-semibold text-mssn-slate transition hover:border-mssn-green/40 hover:text-mssn-greenDark"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
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
