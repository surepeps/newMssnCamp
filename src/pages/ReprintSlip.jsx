import * as React from 'react'
import { toast } from 'sonner'
import { fetchJSON } from '../services/api.js'
import { navigate } from '../utils/navigation.js'
import { useSettings } from '../context/SettingsContext.jsx'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

const logoUrl = 'https://camp.mssnlagos.net/assets/thumbnail_large.png'
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
  const [delegate, setDelegate] = React.useState(null)
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [initialValues, setInitialValues] = React.useState({ mssnId: '', paymentRef: '' })
  const [displayPaymentRef, setDisplayPaymentRef] = React.useState('')
  const mssnFieldRef = React.useRef(null)
  const { settings } = useSettings()
  const camp = settings?.current_camp

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const qM = params.get('mssnId') || ''
      const qR = params.get('paymentRef') || ''
      const formattedM = formatMssnId(qM)
      const formattedR = formatPaymentRef(qR)
      setInitialValues({ mssnId: formattedM, paymentRef: formattedR })
      setDisplayPaymentRef(formattedR)
      if (formattedM && formattedR) {
        ;(async () => {
          setLoading(true)
          setError('')
          try {
            const payload = { mssn_id: formattedM, payment_ref: formattedR }
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

  const summaryItems = React.useMemo(() => buildSummaryItems(delegate, displayPaymentRef), [delegate, displayPaymentRef])
  const detailItems = React.useMemo(() => buildDetailItems(delegate), [delegate])

  const validationSchema = React.useMemo(() => Yup.object({
    mssnId: Yup.string().transform((v) => (typeof v==='string'? formatMssnId(v): v)).trim().required('Required'),
    paymentRef: Yup.string().transform((v) => (typeof v==='string'? formatPaymentRef(v): v)).trim().required('Required'),
  }), [])

  const submit = async (values, helpers) => {
    const formattedMssn = formatMssnId(values.mssnId)
    const formattedRef = formatPaymentRef(values.paymentRef)
    if (!formattedMssn || !formattedRef) {
      setError('Enter both MSSN ID and payment reference to continue.')
      helpers.setSubmitting(false)
      return
    }
    setError('')
    setDisplayPaymentRef(formattedRef)
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
      if (err?.name === 'AbortError') setError('Request timed out. Please try again in a moment.')
      else if (err?.message) setError(err.message)
      else setError('Unable to fetch registration slip. Please try again later.')
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const handleClear = (resetForm) => {
    resetForm({ values: { mssnId: '', paymentRef: '' } })
    setDelegate(null)
    setError('')
    setDisplayPaymentRef('')
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

          <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} validateOnMount onSubmit={submit}>
            {(formik) => (
              <Form className="mt-6 space-y-8 px-6 pb-8 sm:px-8" noValidate>
                <div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="mssnId" className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70">
                          MSSN ID *
                        </label>
                        {formik.touched.mssnId && formik.errors.mssnId ? <span className="text-xs font-medium text-rose-500">{formik.errors.mssnId}</span> : null}
                      </div>
                      <input
                        id="mssnId"
                        name="mssnId"
                        type="text"
                        required
                        placeholder="Enter MSSN ID"
                        autoComplete="off"
                        value={formik.values.mssnId}
                        ref={mssnFieldRef}
                        onChange={(e) => formik.setFieldValue('mssnId', formatMssnId(e.target.value))}
                        onBlur={formik.handleBlur}
                        className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2 ${formik.touched.mssnId && formik.errors.mssnId ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 focus:border-mssn-green focus:ring-mssn-green/25'}`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="paymentRef" className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70">
                          Payment reference *
                        </label>
                        {formik.touched.paymentRef && formik.errors.paymentRef ? <span className="text-xs font-medium text-rose-500">{formik.errors.paymentRef}</span> : null}
                      </div>
                      <input
                        id="paymentRef"
                        name="paymentRef"
                        type="text"
                        required
                        placeholder="Enter payment reference"
                        autoComplete="off"
                        value={formik.values.paymentRef}
                        onChange={(e) => formik.setFieldValue('paymentRef', formatPaymentRef(e.target.value))}
                        onBlur={formik.handleBlur}
                        className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2 ${formik.touched.paymentRef && formik.errors.paymentRef ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 focus:border-mssn-green focus:ring-mssn-green/25'}`}
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
                    disabled={!formik.isValid || formik.isSubmitting}
                    className={`inline-flex items-center justify-center rounded-2xl px-8 py-3 text-sm font-semibold transition ${formik.isValid ? 'bg-mssn-green cursor-pointer text-white hover:from-mssn-greenDark hover:to-mssn-greenDark' : 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60'}`}
                  >
                    {formik.isSubmitting ? 'Fetching slip…' : 'Retrieve slip'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClear(formik.resetForm)}
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
                    New registration
                  </button>
                </div>

                {(loading || formik.isSubmitting) ? (
                  <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/30">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-soft">
                      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-mssn-green border-t-transparent" />
                      <h3 className="mt-4 text-base font-semibold text-mssn-slate">Processing</h3>
                      <p className="mt-1 text-sm text-mssn-slate/70">Fetching your registration slip. Please wait…</p>
                    </div>
                  </div>
                ) : null}
              </Form>
            )}
          </Formik>
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
              </div>
            </div>
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
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-mssn-slate/10 bg-mssn-mist/70 px-4 py-3">
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Payment reference</dt>
                  <dd className="mt-1 text-sm font-semibold text-mssn-slate">{delegate?.payment_reference || displayPaymentRef}</dd>
                </div>
                {delegate?.payment_status ? (
                  <div className="rounded-xl border border-mssn-green/20 bg-mssn-green/10 px-4 py-3">
                    <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Status</dt>
                    <dd className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-mssn-greenDark">
                      <span className="rounded-full border border-mssn-green/30 bg-white/60 px-2 py-0.5">{titleCase(delegate.payment_status)}</span>
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
      ) : null}
    </section>
  )
}
