import { useState } from 'react'
import { navigate } from '../utils/navigation.js'
import StepProgress from '../components/StepProgress.jsx'
import { RegistrationForm } from './NewMember.jsx'
import { fetchJSON } from '../services/api.js'
import { toast } from 'sonner'

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
    const t = toast.loading('Verifying details…')
    try {
      const payload = { mssn_id: mssnId.trim(), surname: surname.trim() }
      const res = await fetchJSON('/registration/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res?.success || !res?.delegate?.details) {
        setError('Record not found. Check details and try again.')
        toast.error('Record not found. Check details and try again.')
      } else {
        setDelegate(res.delegate)
        localStorage.setItem('existing_member_delegate', JSON.stringify(res.delegate))
        toast.success('Record found. You can now update your details.')
      }
    } catch (err) {
      setError('Unable to verify at the moment. Please try again later.')
    } finally {
      toast.dismiss(t)
      setLoading(false)
    }
  }

  const categorySlug = (() => {
    const d = delegate?.details
    if (!d) return null
    const baseCat = String(d.pin_category || d.pin_cat || '').toUpperCase()
    let slug = baseCat === 'SECONDARY' ? 'secondary' : baseCat === 'UNDERGRADUATE' ? 'undergraduate' : 'others'
    if (baseCat === 'TFL') slug = 'secondary'
    const toCat = delegate?.upgraded && delegate.upgrade_details?.[0]?.to?.pin_category
    if (toCat) {
      const t = String(toCat).toUpperCase()
      slug = t === 'SECONDARY' ? 'secondary' : t === 'UNDERGRADUATE' ? 'undergraduate' : 'others'
    }
    return slug
  })()

  const prefillValues = (() => {
    const d = delegate?.details
    if (!d) return null
    const sex = d.sex ? (String(d.sex).toLowerCase().startsWith('m') ? 'Male' : 'Female') : ''
    const ailments = Array.isArray(d.ailments)
      ? d.ailments
      : (typeof d.ailments === 'string'
          ? d.ailments.split(',').map((s) => s.trim()).filter((s) => s && s.toLowerCase() !== 'none')
          : [])
    return {
      surname: d.surname || '',
      firstname: d.firstname || '',
      othername: d.othername || '',
      sex,
      date_of_birth: d.date_of_birth || '',
      area_council: d.area_council || '',
      branch: d.branch || '',
      email: d.email || '',
      tel_no: d.tel_no || '',
      resident_address: d.resident_address || '',
      marital_status: d.marital_status || '',
      state_of_origin: d.state_of_origin || '',
      school: d.school || '',
      class_level: d.class_level || '',
      ailments,
      course: d.course || '',
      next_of_kin: d.next_of_kin || '',
      next_of_kin_tel: d.next_of_kin_tel || '',
      discipline: d.discipline || '',
      workplace: d.workplace || ''
    }
  })()

  const handleExistingSubmit = (values, helpers) => {
    const payload = { ...values, mssn_id: delegate?.details?.mssn_id || delegate?.details?.mssnId || '' }
    try {
      const prev = JSON.parse(localStorage.getItem('existing_member_updates') || '[]')
      localStorage.setItem('existing_member_updates', JSON.stringify([...prev, payload]))
    } catch {}
    helpers.setSubmitting(false)
    toast.success('Details updated. Redirecting to payment…')
    navigate('/registration')
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-6">
        <StepProgress steps={["Validate", "Edit", "Pay"]} current={delegate?.details ? 1 : 0} />
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
            <div className="mt-6">
              <div className="mb-4 rounded-2xl border border-mssn-green/30 bg-mssn-green/10 p-3 text-sm text-mssn-slate">
                <span className="font-semibold">Record found:</span> {delegate.details.surname} {delegate.details.firstname} • {delegate.details.mssn_id || delegate.details.mssnId || 'N/A'}
              </div>
              <RegistrationForm
                category={categorySlug || 'others'}
                prefillValues={prefillValues || {}}
                submitLabel="Update & Pay"
                enableDraft={false}
                onSubmit={handleExistingSubmit}
              />
            </div>
          ) : null}
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
