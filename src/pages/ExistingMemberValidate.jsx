import { useState } from 'react'
import { navigate } from '../utils/navigation.js'
import StepProgress from '../components/StepProgress.jsx'
import { fetchJSON } from '../services/api.js'

export default function ExistingMemberValidate() {
  const [mssnId, setMssnId] = useState('')
  const [surname, setSurname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [delegate, setDelegate] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    setLoading(true)
    setError('')
    setDelegate(null)
    try {
      const payload = { mssn_id: mssnId.trim(), surname: surname.trim() }
      const res = await fetchJSON('/registration/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res?.success || !res?.delegate?.details) {
        setError('Record not found. Check details and try again.')
      } else {
        setDelegate(res.delegate)
        localStorage.setItem('existing_member_delegate', JSON.stringify(res.delegate))
      }
    } catch (err) {
      setError('Unable to verify at the moment. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-6">
        <StepProgress steps={["Validate", "Edit", "Pay"]} current={0} />
      </div>
      <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-mssn-slate">Existing Member Validation</h1>
          <p className="mt-2 text-sm text-mssn-slate/70">Enter your MSSN ID and Surname to continue.</p>
          <form id="validateForm" className="mt-6 grid gap-5" data-parsley-validate onSubmit={onSubmit} noValidate>
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
            ) : null}
            <div>
              <label htmlFor="mssnId" className="block text-sm font-semibold text-mssn-slate">MSSN ID</label>
              <input
                id="mssnId"
                name="mssnId"
                type="text"
                required
                placeholder="ENTER MSSN ID"
                value={mssnId}
                onChange={(e) => setMssnId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3 text-mssn-slate outline-none ring-2 ring-transparent focus:ring-mssn-green/30"
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
                onChange={(e) => setSurname(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3 text-mssn-slate outline-none ring-2 ring-transparent focus:ring-mssn-green/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto ${loading ? 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60' : 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white hover:translate-y-[-2px]'}`}
            >
              {loading ? 'Verifying…' : 'Validate'}
            </button>
          </form>
          <div className="mt-6 rounded-2xl border border-mssn-slate/10 bg-mssn-mist/60 p-4 text-sm text-mssn-slate/80">
            We’ll verify your details and take you to the edit page to confirm or update your information before payment.
          </div>

          {delegate?.details ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-mssn-slate/10 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-mssn-slate">Record found</div>
                    <div className="text-xs text-mssn-slate/70">{delegate.details.surname} {delegate.details.firstname} • {delegate.details.mssn_id || delegate.details.mssnId || 'N/A'}</div>
                  </div>
                  <button type="button" onClick={() => navigate(`/existing/edit?mssnId=${encodeURIComponent(delegate.details.mssn_id || delegate.details.mssnId || '')}&surname=${encodeURIComponent(delegate.details.surname || '')}`)} className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white">
                    Continue to Edit
                  </button>
                </div>
                <dl className="mt-4 grid gap-2 text-xs text-mssn-slate/80 sm:grid-cols-2">
                  <div className="rounded-xl bg-mssn-mist/60 p-2"><dt className="font-semibold text-mssn-slate/70">Category</dt><dd>{delegate.details.pin_category || delegate.details.pin_cat || '—'}</dd></div>
                  <div className="rounded-xl bg-mssn-mist/60 p-2"><dt className="font-semibold text-mssn-slate/70">School</dt><dd>{delegate.details.school || '—'}</dd></div>
                  <div className="rounded-xl bg-mssn-mist/60 p-2"><dt className="font-semibold text-mssn-slate/70">Class Level</dt><dd>{delegate.details.class_level || '—'}</dd></div>
                  <div className="rounded-xl bg-mssn-mist/60 p-2"><dt className="font-semibold text-mssn-slate/70">Course</dt><dd>{delegate.details.course || '—'}</dd></div>
                </dl>
              </div>
              {delegate.upgraded && delegate.upgrade_details?.length ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="font-semibold">Upgrade required</div>
                  <ul className="mt-2 list-inside list-disc text-xs">
                    {delegate.upgrade_details.map((u, i) => (
                      <li key={i}>From {u.from?.pin_category || '—'} {u.from?.class_level || ''} to {u.to?.pin_category || '—'} {u.to?.class_level || ''}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
