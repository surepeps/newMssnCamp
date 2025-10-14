import { useEffect, useMemo, useRef, useState } from 'react'
import { navigate, createNavigationHandler } from '../utils/navigation.js'
import { fetchJSON } from '../services/api.js'
import { toast } from 'sonner'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

const goToCheckMssnId = createNavigationHandler('/check-mssn-id')

export default function ExistingMemberValidate() {
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [pendingDelegate, setPendingDelegate] = useState(null)
  const mssnRef = useRef(null)

  const formatMssn = (val) => (typeof val === 'string' ? val.replace(/\s+/g, '').toUpperCase() : val)
  const formatSurname = (val) => (typeof val === 'string' ? val.replace(/\s{2,}/g, ' ').trim().toUpperCase() : val)

  const [initialValues, setInitialValues] = useState({ mssnId: '', surname: '' })
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const qMssn = params.get('mssnId') || ''
      const qSurname = params.get('surname') || ''
      setInitialValues({ mssnId: formatMssn(qMssn), surname: formatSurname(qSurname) })
    } catch {}
    mssnRef.current?.focus()
  }, [])

  const validationSchema = useMemo(() =>
    Yup.object({
      mssnId: Yup.string()
        .transform((v) => formatMssn(v))
        .trim()
        .required('Required'),
      surname: Yup.string()
        .transform((v) => formatSurname(v))
        .trim()
        .required('Required'),
    })
  , [])

  const handleSubmit = async (values, helpers) => {
    setError('')
    try {
      const payload = { mssn_id: formatMssn(values.mssnId), surname: formatSurname(values.surname) }
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
        const needsUpgrade = Boolean(res?.delegate?.upgraded)
        if (needsUpgrade) {
          setPendingDelegate(res.delegate)
          setShowUpgradeModal(true)
        } else {
          toast.success('Record found. Proceed to edit your details.')
          const qs = new URLSearchParams({ mssnId: payload.mssn_id, surname: payload.surname }).toString()
          navigate(`/existing/edit?${qs}`)
        }
      }
    } catch (err) {
      let msg = 'Unable to verify at the moment. Please try again later.'
      if (err?.name === 'AbortError') msg = 'Request timed out. Please check your internet connection and try again.'
      else if (err?.message) msg = err.message
      else if (typeof err?.status === 'number') {
        if (err.status === 400 || err.status === 422) msg = 'Invalid details provided. Please check MSSN ID and Surname.'
        else if (err.status === 404) msg = 'Record not found.'
        else if (err.status === 429) msg = 'Too many attempts. Please wait a moment and try again.'
        else if (err.status >= 500) msg = 'Server error. Please try again shortly.'
      }
      setError(msg)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const clearForm = (resetForm) => {
    resetForm({ values: { mssnId: '', surname: '' } })
    setError('')
    mssnRef.current?.focus()
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="bg-radial-glow/40 rounded-3xl">
          <div className="flex flex-col gap-4 px-6 pt-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">Existing Member</span>
              <h1 className="mt-2 text-3xl font-semibold text-mssn-slate">Validation</h1>
              <p className="mt-2 text-sm text-mssn-slate/70">Enter your MSSN ID and surname to continue.</p>
            </div>
            <a
              href="/check-mssn-id"
              onClick={goToCheckMssnId}
              className="inline-flex items-center text-sm font-semibold text-mssn-greenDark underline underline-offset-2 decoration-mssn-green/60 transition hover:text-mssn-green hover:decoration-mssn-greenDark cursor-pointer"
            >
              Don’t know your MSSN ID?
            </a>
          </div>

        </div>

        <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} validateOnMount onSubmit={handleSubmit}>
          {(formik) => (
            <Form id="validateForm" className="mt-6 space-y-8 px-6 pb-8 sm:px-8" noValidate>
              <div>
                <div className="mt-6 grid gap-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="mssnId" className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70">MSSN ID *</label>
                      {formik.touched.mssnId && formik.errors.mssnId ? <span className="text-xs font-medium text-rose-500">{formik.errors.mssnId}</span> : null}
                    </div>
                    <input
                      id="mssnId"
                      name="mssnId"
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      placeholder="ENTER MSSN ID"
                      value={formik.values.mssnId}
                      ref={mssnRef}
                      onChange={(e) => formik.setFieldValue('mssnId', formatMssn(e.target.value))}
                      onBlur={formik.handleBlur}
                      className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2 ${(formik.touched.mssnId && formik.errors.mssnId) ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 focus:border-mssn-green focus:ring-mssn-green/25'}`}
                      aria-invalid={Boolean(formik.touched.mssnId && formik.errors.mssnId)}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="surname" className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70">Surname *</label>
                      {formik.touched.surname && formik.errors.surname ? <span className="text-xs font-medium text-rose-500">{formik.errors.surname}</span> : null}
                    </div>
                    <input
                      id="surname"
                      name="surname"
                      type="text"
                      placeholder="ENTER SURNAME"
                      value={formik.values.surname}
                      onChange={(e) => formik.setFieldValue('surname', formatSurname(e.target.value))}
                      onBlur={formik.handleBlur}
                      className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2 ${(formik.touched.surname && formik.errors.surname) ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 focus:border-mssn-green focus:ring-mssn-green/25'}`}
                      aria-invalid={Boolean(formik.touched.surname && formik.errors.surname)}
                      required
                    />
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={!formik.isValid || formik.isSubmitting}
                  className={`inline-flex items-center justify-center rounded-2xl px-8 py-3 text-sm font-semibold transition ${formik.isValid ? 'bg-mssn-green cursor-pointer text-white hover:from-mssn-greenDark hover:to-mssn-greenDark' : 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60'}`}
                >
                  {formik.isSubmitting ? 'Verifying…' : 'Validate'}
                </button>
                <button
                  type="button"
                  onClick={() => clearForm(formik.resetForm)}
                  disabled={formik.isSubmitting}
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

              {formik.isSubmitting && (
                <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40">
                  <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-soft">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-mssn-green border-t-transparent" />
                    <h3 className="mt-4 text-base font-semibold text-mssn-slate">Processing</h3>
                    <p className="mt-1 text-sm text-mssn-slate/70">Verifying your details. Please wait…</p>
                  </div>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-[1002] grid place-items-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-mssn-slate">Upgrade Required</h3>
            <p className="mt-2 text-sm text-mssn-slate/70">This account needs to be upgraded before proceeding. Please upgrade to the appropriate category to continue.</p>
            {pendingDelegate?.upgrade_details?.length ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                {pendingDelegate.upgrade_details.map((u,i)=>`From ${u.from?.pin_category||'—'} ${u.from?.class_level||''} to ${u.to?.pin_category||'—'} ${u.to?.class_level||''}`).join('; ')}
              </div>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowUpgradeModal(false)} className="rounded-xl border border-mssn-slate/20 px-4 py-2 text-sm font-semibold text-mssn-slate">Cancel</button>
              <button type="button" onClick={() => {
                const params = new URLSearchParams(window.location.search)
                const m = (params.get('mssnId') || '').replace(/\s+/g,'').toUpperCase()
                const s = (params.get('surname') || '').replace(/\s{2,}/g,' ').trim().toUpperCase()
                const qs = new URLSearchParams({ mssnId: m, surname: s, upgrade: '1' }).toString()
                setShowUpgradeModal(false)
                navigate(`/existing/edit?${qs}`)
              }} className="rounded-xl bg-mssn-green px-4 py-2 text-sm font-semibold text-white">Start Upgrade</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
