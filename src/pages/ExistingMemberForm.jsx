import * as React from 'react'
import AsyncSelect from '../components/AsyncSelect.jsx'
import { navigate } from '../utils/navigation.js'
import { fetchJSON } from '../services/api.js'
import {
  fetchHighestQualifications,
  queryStates,
  queryAilments,
  queryCouncils,
  querySchools,
  queryClassLevels,
  queryCourses,
} from '../services/dataProvider.js'
import { Formik, Form as FormikForm } from 'formik'
import * as Yup from 'yup'
import { toast } from 'sonner'
import ProcessingModal from '../components/ProcessingModal.jsx'

function useQuery() {
  return React.useMemo(() => new URLSearchParams(window.location.search), [])
}

// Replicated helpers to match /new/:section look
function FieldShellEM({ label, required, error, htmlFor, children, className }) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70">
          {label}
          {required ? ' *' : ''}
        </label>
        {error ? <span className="text-xs font-medium text-rose-500">{error}</span> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function TextFieldEM({ formik, name, label, type = 'text', required = false, placeholder, as, rows = 3, className }) {
  const error = formik.touched[name] && formik.errors[name]
  const id = `${name}-field`
  const val = formik.values[name]
  const isEmpty = (v) => (v == null ? true : typeof v === 'string' ? v.trim().length === 0 : false)
  const invalid = (required && isEmpty(val)) || (!!error)
  const baseClass = `w-full rounded-xl border ${invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 focus:border-mssn-green focus:ring-mssn-green/25'} bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2`

  return (
    <FieldShellEM label={label} required={required} error={error} htmlFor={id} className={className}>
      {as === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={placeholder}
          className={`${baseClass} resize-none`}
          required={required}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={placeholder}
          className={baseClass}
          min={type === 'number' ? '1' : undefined}
          required={required}
        />
      )}
    </FieldShellEM>
  )
}

function SelectFieldEM({ formik, name, label, options, required = false, placeholder = 'Select...', className }) {
  const error = formik.touched[name] && formik.errors[name]
  const id = `${name}-select`
  const value = formik.values[name]
  const invalid = (required && (!value || String(value).trim() === '')) || (!!error)
  return (
    <FieldShellEM label={label} required={required} error={error} htmlFor={id} className={className}>
      <select
        id={id}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        required={required}
        className={`w-full rounded-xl border ${invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 focus:border-mssn-green focus:ring-mssn-green/25'} bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FieldShellEM>
  )
}

function FormikAsyncSelectEM({ formik, name, label, required = false, className, ...props }) {
  const error = formik.touched[name] && formik.errors[name]
  const val = formik.values[name]
  const isEmpty = Array.isArray(val) ? val.length === 0 : !val || String(val).trim() === ''
  const invalid = (required && isEmpty) || (!!error)
  return (
    <FieldShellEM label={label} required={required} error={error} className={className}>
      <AsyncSelect
        {...props}
        value={formik.values[name]}
        onChange={(val) => formik.setFieldValue(name, val)}
        onBlur={() => formik.setFieldTouched(name, true)}
        invalid={invalid}
      />
    </FieldShellEM>
  )
}

function SectionCardEM({ title, description, columns = 'sm:grid-cols-2', children }) {
  return (
    <div className="bg-white/90">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-mssn-green">{title}</h2>
        {description ? <p className="mt-2 text-sm text-mssn-slate/70">{description}</p> : null}
      </div>
      <div className={`mt-6 grid gap-5 ${columns}`}>
        {children}
      </div>
    </div>
  )
}

function buildValidationSchemaEM({ showEmergency, showCourse, showDiscipline, showWorkplace, showHighestQualification }) {
  const optionalString = Yup.string().transform((value) => {
    if (typeof value !== 'string') return value
    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
  })

  const shape = {
    surname: Yup.string().trim().required('Required'),
    firstname: Yup.string().trim().required('Required'),
    othername: optionalString.nullable(),
    sex: Yup.string().required('Required'),
    date_of_birth: Yup.number().typeError('Enter a valid age').min(1, 'Must be greater than 0').required('Required'),
    area_council: Yup.string().required('Required'),
    branch: Yup.string().required('Required'),
    email: optionalString.nullable().email('Enter a valid email'),
    tel_no: optionalString.nullable(),
    resident_address: optionalString.nullable(),
    marital_status: optionalString.nullable(),
    state_of_origin: optionalString.nullable(),
    school: optionalString.nullable(),
    class_level: optionalString.nullable(),
    ailments: Yup.array().of(Yup.string()),
  }
  if (showEmergency) {
    shape.next_of_kin = optionalString.nullable()
    shape.next_of_kin_tel = optionalString.nullable()
  }
  if (showCourse) {
    shape.course = optionalString.nullable()
  }
  if (showHighestQualification) {
    shape.highest_qualification = optionalString.nullable().required('Required')
  }
  if (showDiscipline) {
    shape.discipline = optionalString.nullable()
  }
  if (showWorkplace) {
    shape.workplace = optionalString.nullable()
  }
  return Yup.object(shape)
}

const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed']

export default function ExistingMemberForm() {
  const query = useQuery()
  const [category, setCategory] = React.useState('')
  const [delegate, setDelegate] = React.useState(null)
  const [qualifications, setQualifications] = React.useState([])
  const [activeSection, setActiveSection] = React.useState('personal')
  const [loading, setLoading] = React.useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)
  const [showRegisteredModal, setShowRegisteredModal] = React.useState(false)
  const [loadError, setLoadError] = React.useState('')
  const [upgradeStarted, setUpgradeStarted] = React.useState(() => (query.get('upgrade') || '') === '1')
  const [processing, setProcessing] = React.useState(false)
  const [redirecting, setRedirecting] = React.useState(false)

  // AsyncSelect controlled values
  const [vCouncil, setVCouncil] = React.useState('')
  const [vBranch, setVBranch] = React.useState('')
  const [vState, setVState] = React.useState('')
  const [vSchool, setVSchool] = React.useState('')
  const [vClassLevel, setVClassLevel] = React.useState('')
  const [vCourse, setVCourse] = React.useState('')
  const [vAilments, setVAilments] = React.useState([])

  const details = delegate?.details || {}
  const upgradeTarget = delegate?.upgrade_details?.[0]?.to || {}
  const targetPin = String(upgradeTarget?.pin_category || '').toUpperCase()
  const targetCategory = targetPin === 'UNDERGRADUATE' ? 'undergraduate' : targetPin === 'OTHERS' ? 'others' : targetPin === 'SECONDARY' || targetPin === 'TFL' ? 'secondary' : ''
  const currentCategoryLower = category === 'Undergraduate' ? 'undergraduate' : category === 'Secondary' ? 'secondary' : category === 'Others' ? 'others' : ''
  const categoryKey = targetCategory || currentCategoryLower || 'secondary'
  const qualificationAudience = categoryKey === 'undergraduate' ? 'Undergraduate' : categoryKey === 'others' ? 'Others' : ''

  const mssnId = query.get('mssnId') || ''
  const surname = query.get('surname') || ''

  const mapCategory = (pin) => {
    const p = String(pin || '').toUpperCase()
    if (p === 'TFL') return 'TFL'
    if (p === 'SECONDARY') return 'Secondary'
    if (p === 'UNDERGRADUATE') return 'Undergraduate'
    if (p === 'OTHERS' || p === 'OTH') return 'Others'
    return ''
  }

  React.useEffect(() => {
    ;(async () => {
      try {
        const qM = (mssnId || '').trim()
        const qS = (surname || '').trim()
        if (qM && qS) {
          setLoading(true)
          const res = await fetchJSON('/registration/fetch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mssn_id: qM, surname: qS }),
          })
          if (res?.success && res?.delegate?.details) {
            setDelegate(res.delegate)
            const cat = mapCategory(res.delegate?.details?.pin_category || res.delegate?.details?.pin_cat)
            if (cat) setCategory(cat)
            setShowUpgradeModal(Boolean(res.delegate?.upgraded) && !((query.get('upgrade') || '') === '1'))
            setShowRegisteredModal(Boolean(res.delegate?.alreadyRegistered))
          } else {
            const msg = res?.message || 'Unable to load record. Please check details and try again.'
            setLoadError(msg)
          }
        } else {
          navigate('/existing/validate')
        }
      } catch (err) {
        const msg = err?.message || 'Unable to load record. Please try again later.'
        setLoadError(msg)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const refs = {
    personal: React.useRef(null),
    contact: React.useRef(null),
    emergency: React.useRef(null),
    details: React.useRef(null),
    education: React.useRef(null),
    membership: React.useRef(null),
  }

  React.useEffect(() => {
    let cancelled = false
    const loadQualifications = async () => {
      try {
        const list = await fetchHighestQualifications({ who: qualificationAudience })
        if (!cancelled) {
          setQualifications(Array.isArray(list) ? list : [])
        }
      } catch {
        if (!cancelled) setQualifications([])
      }
    }
    if (qualificationAudience) {
      loadQualifications()
    } else {
      setQualifications([])
    }
    return () => {
      cancelled = true
    }
  }, [qualificationAudience])

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    Object.values(refs).forEach((r) => r.current && observer.observe(r.current))
    return () => observer.disconnect()
  }, [])

  const qualificationOptions = React.useMemo(() => {
    if (!qualifications.length) return []
    if (!qualificationAudience) return qualifications.map((item) => item.label)
    const normalizedAudience = qualificationAudience.toLowerCase()
    const filtered = qualifications.filter((item) => String(item.who || '').trim().toLowerCase() === normalizedAudience)
    const source = filtered.length ? filtered : qualifications
    return source.map((item) => item.label)
  }, [qualificationAudience, qualifications])

  React.useEffect(() => {
    if (!delegate?.details) return
    const normalize = (v) => (v == null ? '' : String(v).trim())
    setVCouncil(normalize(details.area_council))
    setVBranch(normalize(details.branch))
    setVState(normalize(details.state_of_origin))
    if (category !== 'TFL') setVSchool(normalize(details.school))
    const targetClassLevel = delegate?.upgrade_details?.[0]?.to?.class_level
    setVClassLevel(normalize(targetClassLevel != null ? targetClassLevel : details.class_level))
    setVCourse(normalize(details.course))
    const rawA = normalize(details.ailments)
    const arrA = rawA && rawA.toLowerCase() !== 'none' ? rawA.split(',').map((s) => s.trim()).filter(Boolean) : []
    setVAilments(arrA)
  }, [category, delegate])


  const schoolIdentifier = categoryKey === 'secondary' ? 'S' : categoryKey === 'undergraduate' ? 'U' : 'U'
  const classIdentifier = categoryKey === 'secondary' ? 'S' : categoryKey === 'undergraduate' ? 'U' : 'O'

  const buildPrefill = () => {
    const d = details || {}
    const toInfo = upgradeTarget || {}
    const sx = (d.sex || '').toString().trim().toLowerCase()
    const parseA = (v) => {
      const s = (v == null ? '' : String(v)).trim()
      if (!s) return []
      return s.toLowerCase() === 'none' ? [] : s.split(',').map((s) => s.trim()).filter(Boolean)
    }
    return {
      surname: d.surname || surname || '',
      firstname: d.firstname || '',
      othername: d.othername || '',
      sex: sx === 'male' ? 'Male' : sx === 'female' ? 'Female' : '',
      date_of_birth: d.date_of_birth || '',
      area_council: d.area_council || '',
      branch: d.branch || '',
      email: d.email || '',
      tel_no: d.tel_no || '',
      resident_address: d.resident_address || '',
      marital_status: d.marital_status || 'Single',
      state_of_origin: d.state_of_origin || '',
      school: d.school || '',
      class_level: toInfo.class_level || d.class_level || '',
      ailments: parseA(d.ailments),
      course: d.course || '',
      highest_qualification: d.highest_qualification || '',
      next_of_kin: d.next_of_kin || '',
      next_of_kin_tel: d.next_of_kin_tel || '',
      discipline: d.discipline || '',
      workplace: d.workplace || ''
    }
  }

  const initialValuesEM = React.useMemo(() => buildPrefill(), [delegate, surname])

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      {(showUpgradeModal || showRegisteredModal || loadError) ? null : (
        <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white">
          <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
          <div className="bg-radial-glow/40 rounded-3xl">
            <div className="flex flex-col gap-2 px-6 pt-8 sm:flex-row sm:items-start sm:justify-between sm:px-10">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">Existing Member</span>
                <h1 className="mt-2 text-3xl font-semibold text-mssn-slate">{delegate?.details?.pin_category} FORM</h1>
                <p className="mt-2 text-sm text-mssn-slate/70">MSSN ID: <span className="font-semibold">{mssnId}</span>, Surname: <span className="font-semibold">{surname}</span></p>
                {delegate?.upgraded && delegate.upgrade_details?.length ? (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    Upgrade suggested: {delegate.upgrade_details.map((u,i)=>`From ${u.from?.pin_category||'—'} ${u.from?.class_level||''} to ${u.to?.pin_category||'—'} ${u.to?.class_level||''}`).join('; ')}
                  </div>
                ) : null}
                {upgradeStarted && (
                  <div className="mt-3 rounded-2xl border border-mssn-green/30 bg-mssn-green/10 p-3 text-xs text-mssn-greenDark">
                    Your account has been upgraded to {categoryKey==='undergraduate'?'Undergraduate':categoryKey==='secondary'?'Secondary':'Others'}.
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-10 pt-6 sm:px-10">
              <Formik
                initialValues={initialValuesEM}
                validationSchema={buildValidationSchemaEM({
                  showCourse: categoryKey === 'undergraduate' || categoryKey === 'others',
                  showDiscipline: categoryKey === 'undergraduate' || categoryKey === 'others',
                  showWorkplace: categoryKey === 'undergraduate' || categoryKey === 'others',
                  showEmergency: categoryKey === 'undergraduate' || categoryKey === 'others',
                  showHighestQualification: categoryKey === 'undergraduate' || categoryKey === 'others',
                })}
                enableReinitialize
                onSubmit={async (values, helpers) => {
                  const normalize = (input) => {
                    if (Array.isArray(input)) return input.filter(Boolean)
                    if (typeof input === 'string') {
                      const trimmed = input.trim()
                      return trimmed.length ? trimmed : undefined
                    }
                    return input === undefined || input === null ? undefined : input
                  }
                  const categoryApi = categoryKey === 'undergraduate' ? 'UNDERGRADUATE' : categoryKey === 'secondary' ? 'SECONDARY' : 'OTHERS'
                  const payload = {
                    mssn_id: (mssnId || delegate?.details?.mssn_id || '').toString().trim(),
                    surname: values.surname.trim(),
                    firstname: values.firstname.trim(),
                    othername: normalize(values.othername),
                    sex: values.sex,
                    date_of_birth: String(values.date_of_birth).trim(),
                    area_council: values.area_council,
                    branch: values.branch,
                    email: normalize(values.email),
                    tel_no: normalize(values.tel_no),
                    resident_address: normalize(values.resident_address),
                    marital_status: normalize(values.marital_status) || 'Single',
                    state_of_origin: normalize(values.state_of_origin),
                    ailments: (normalize(values.ailments) || []).join(','),
                    pin_category: categoryApi,
                  }
                  payload.school = normalize(values.school)
                  payload.class_level = normalize(values.class_level)
                  if (categoryKey === 'undergraduate' || categoryKey === 'others') {
                    payload.next_of_kin = normalize(values.next_of_kin)
                    payload.next_of_kin_tel = normalize(values.next_of_kin_tel)
                    payload.course = normalize(values.course)
                    payload.highest_qualification = normalize(values.highest_qualification)
                    payload.discipline = normalize(values.discipline)
                    payload.workplace = normalize(values.workplace)
                  }
                  Object.keys(payload).forEach((key) => { if (payload[key] === undefined) delete payload[key] })
                  try { 
                    setProcessing(true)
                    const res = await fetchJSON('/registration/existing', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    })
                    const data = res?.data || {}
                    const message = data.message || res?.message || 'Registered successfully'
                    const priceInfo = typeof data.price !== 'undefined' ? ` • ₦${Number(data.price).toFixed(2)}` : ''
                    const discount = data.discount_applied ? ' • discount applied' : ''
                    toast.success(`${message}${priceInfo}${discount}`)
                    if (data.redirect_url) {
                      setRedirecting(true)
                      setTimeout(() => {
                        window.location.href = data.redirect_url
                      }, 700)
                    } else {
                      setRedirecting(true)
                      setTimeout(() => {
                        navigate('/registration')
                      }, 700)
                    }
                  } catch (e) {
                    console.log(e)
                  } finally {
                    helpers.setSubmitting(false)
                    setProcessing(false)
                  }
                }}
              >
                {(formik) => (
                  <FormikForm className="mt-10 space-y-10 px-0 pb-0 sm:px-0">
                    <input type="hidden" name="pin_category" value={categoryKey} />

                    <SectionCardEM title="Personal details" description="Tell us a little about who you are.">
                      <TextFieldEM formik={formik} name="surname" label="Surname" required placeholder="Enter surname" />
                      <TextFieldEM formik={formik} name="firstname" label="Firstname" required placeholder="Enter firstname" />
                      <SelectFieldEM formik={formik} name="sex" label="Gender" required options={['Male','Female']} placeholder="Select gender" />
                      <TextFieldEM formik={formik} name="date_of_birth" label="Age" type="number" required placeholder="Enter age" />
                      <TextFieldEM formik={formik} name="othername" label="Othername" placeholder="Enter other names" className="sm:col-span-2" />
                    </SectionCardEM>

                    <SectionCardEM title="Contact & location" description="How can we reach you and where are you based?" columns="sm:grid-cols-2">
                      <FormikAsyncSelectEM formik={formik} name="area_council" label="Area Council" required placeholder="Select council..." fetchPage={({ page, search }) => queryCouncils({ page, limit: 20, search })} />
                      <TextFieldEM formik={formik} name="branch" label="Branch" required placeholder="Enter branch name" />
                      <TextFieldEM formik={formik} name="email" label="Email" type="email" placeholder="name@email.com" />
                      <TextFieldEM formik={formik} name="tel_no" label="Phone Number" placeholder="Enter phone number" />
                      <TextFieldEM formik={formik} name="resident_address" label="Resident Address" as="textarea" rows={3} placeholder="Enter residential address" className="sm:col-span-2" />
                      <SelectFieldEM formik={formik} name="marital_status" label="Marital Status" options={categoryKey==='secondary'?['Single']:MARITAL_OPTIONS} placeholder="Select status" />
                      <FormikAsyncSelectEM formik={formik} name="state_of_origin" label="State of Origin" placeholder="Select state..." fetchPage={({ page, search }) => queryStates({ page, limit: 20, search })} />
                    </SectionCardEM>

                    <SectionCardEM title="Education & Occupation" description="Share your institution and occupation details.">
                      <FormikAsyncSelectEM formik={formik} name="school" label="School" placeholder={categoryKey==='undergraduate'||categoryKey==='others'?'Select institution...':'Select school...'} fetchPage={({ page, search }) => querySchools({ identifier: schoolIdentifier, page, limit: 20, search })} />
                      <FormikAsyncSelectEM formik={formik} name="class_level" label="Class Level" placeholder="Select class level..." fetchPage={({ page, search }) => queryClassLevels({ identifier: classIdentifier, page, limit: 20, search })} />
                      {(categoryKey==='undergraduate'||categoryKey==='others') && (
                        <FormikAsyncSelectEM formik={formik} name="course" label="Course" placeholder="Select course..." fetchPage={({ page, search }) => queryCourses({ page, limit: 20, search })} />
                      )}
                      {(categoryKey==='undergraduate'||categoryKey==='others') && (
                        <SelectFieldEM formik={formik} name="highest_qualification" label="Highest Qualification" required options={qualificationOptions} placeholder="Select qualification..." />
                      )}
                      {(categoryKey==='undergraduate'||categoryKey==='others') && (
                        <TextFieldEM formik={formik} name="discipline" label="Discipline / Occupation" placeholder="Enter discipline or occupation" />
                      )}
                      {(categoryKey==='undergraduate'||categoryKey==='others') && (
                        <TextFieldEM formik={formik} name="workplace" label="Workplace" placeholder="Enter workplace (optional)" className="sm:col-span-2" />
                      )}
                    </SectionCardEM>

                    {(categoryKey==='undergraduate'||categoryKey==='others') && (
                      <SectionCardEM title="Emergency Contact" description="Who should we contact in case of emergency?" columns="sm:grid-cols-2">
                        <TextFieldEM formik={formik} name="next_of_kin" label="Next of Kin" placeholder="Enter next of kin" />
                        <TextFieldEM formik={formik} name="next_of_kin_tel" label="Next of Kin Phone" placeholder="Enter phone number" />
                      </SectionCardEM>
                    )}

                    <SectionCardEM title="Health" description="Let us know of any ailments so we can support you." columns="sm:grid-cols-2">
                      <FormikAsyncSelectEM formik={formik} name="ailments" label="Ailments" multiple placeholder="Select ailments..." fetchPage={({ page, search }) => queryAilments({ page, limit: 20, search })} className="sm:col-span-2" />
                    </SectionCardEM>

                    <div className="flex flex-wrap items-center gap-3">
                      <button type="submit" disabled={!formik.isValid || formik.isSubmitting} className={`inline-flex items-center justify-center rounded-2xl px-8 py-3 text-sm font-semibold transition ${formik.isValid ? 'bg-mssn-green text-white hover:from-mssn-greenDark hover:to-mssn-greenDark' : 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60'}`}>
                        {formik.isSubmitting ? 'Submitting…' : 'Register & Pay'}
                      </button>
                    </div>
                  </FormikForm>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    {loading && (
      <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-soft">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-mssn-green border-t-transparent" />
          <h3 className="mt-4 text-base font-semibold text-mssn-slate">Loading</h3>
          <p className="mt-1 text-sm text-mssn-slate/70">Fetching your details…</p>
        </div>
      </div>
    )}

    {loadError && (
      <div className="fixed inset-0 z-[1001] grid place-items-center bg-black/40">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-mssn-slate">Cannot load record</h3>
          <p className="mt-2 text-sm text-mssn-slate/70">{loadError}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => navigate('/existing/validate')} className="rounded-xl border border-mssn-slate/20 px-4 py-2 text-sm font-semibold text-mssn-slate">Back to Validation</button>
          </div>
        </div>
      </div>
    )}

    {showRegisteredModal && (
      <div className="fixed inset-0 z-[1001] grid place-items-center bg-black/50">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-soft">
          <div className="h-1 w-full bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-mssn-green/10 text-mssn-greenDark">���</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-mssn-slate">You’re already registered</h3>
                <p className="mt-1 text-sm text-mssn-slate/70">We found an existing registration for this MSSN ID. You can re‑print your slip now.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-mssn-mist/70 px-4 py-3">
                    <div className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">MSSN ID</div>
                    <div className="mt-1 text-sm font-semibold text-mssn-slate">{mssnId}</div>
                  </div>
                  <div className="rounded-2xl bg-mssn-mist/70 px-4 py-3">
                    <div className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mssn-slate/60">Name</div>
                    <div className="mt-1 text-sm font-semibold text-mssn-slate">{[details.surname, details.firstname, details.othername].filter(Boolean).join(' ') || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <button type="button" onClick={() => navigate('/existing/validate')} className="rounded-xl border border-mssn-slate/20 px-4 py-2 text-sm font-semibold text-mssn-slate">Back to Validation</button>
              <button
                type="button"
                onClick={() => {
                  const paymentRef = delegate?.payment_reference || delegate?.details?.payment_reference || ''
                  const params = new URLSearchParams()
                  if (mssnId) params.set('mssnId', String(mssnId))
                  if (paymentRef) params.set('paymentRef', String(paymentRef))
                  navigate(`/reprint-slip${params.toString() ? `?${params.toString()}` : ''}`)
                }}
                className="inline-flex items-center justify-center rounded-xl bg-mssn-green cursor-pointer px-4 py-2 text-sm font-semibold text-white hover:bg-mssn-greenDark"
              >
                Re‑print Slip
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {showUpgradeModal && (
      <div className="fixed inset-0 z-[1002] grid place-items-center bg-black/40">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-mssn-slate">Upgrade Required</h3>
          <p className="mt-2 text-sm text-mssn-slate/70">This account needs to be upgraded before proceeding. Please upgrade to the appropriate category to continue.</p>
          {delegate?.upgrade_details?.length ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              {delegate.upgrade_details.map((u,i)=>`From ${u.from?.pin_category||'—'} ${u.from?.class_level||''} to ${u.to?.pin_category||'—'} ${u.to?.class_level||''}`).join('; ')}
            </div>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => navigate('/existing/validate')} className="rounded-xl border border-mssn-slate/20 px-4 py-2 text-sm font-semibold text-mssn-slate">Back to Validation</button>
            <button type="button" onClick={() => { setUpgradeStarted(true); setShowUpgradeModal(false) }} className="rounded-xl bg-mssn-green px-4 py-2 text-sm font-semibold text-white">Start Upgrade</button>
          </div>
        </div>
      </div>
    )}
  <ProcessingModal visible={processing} title="Processing…" subtitle="Please wait while we submit your registration and prepare payment." />
  <ProcessingModal visible={redirecting} title="Redirecting to payment…" subtitle="Please hold on while we redirect you to the payment page." />
  </section>
  )
}
