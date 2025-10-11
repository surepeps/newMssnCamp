import { useEffect, useMemo, useRef, useState } from 'react'
import AsyncSelect from '../components/AsyncSelect.jsx'
import { navigate } from '../utils/navigation.js'
import { fetchJSON } from '../services/api.js'
import {
  fetchMaritalStatuses,
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

const CATEGORY_OPTIONS = ['TFL', 'Secondary', 'Undergraduate', 'Others']

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), [])
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

function buildValidationSchemaEM({ showEmergency, showCourse, showDiscipline, showWorkplace }) {
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
  const [category, setCategory] = useState('')
  const [delegate, setDelegate] = useState(null)
  const [maritalStatuses, setMaritalStatuses] = useState([])
  const [qualifications, setQualifications] = useState([])
  const [activeSection, setActiveSection] = useState('personal')
  const [loading, setLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showRegisteredModal, setShowRegisteredModal] = useState(false)
  const [upgradeStarted, setUpgradeStarted] = useState(() => (query.get('upgrade') || '') === '1')

  // AsyncSelect controlled values
  const [vCouncil, setVCouncil] = useState('')
  const [vBranch, setVBranch] = useState('')
  const [vState, setVState] = useState('')
  const [vSchool, setVSchool] = useState('')
  const [vClassLevel, setVClassLevel] = useState('')
  const [vCourse, setVCourse] = useState('')
  const [vAilments, setVAilments] = useState([])

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

  useEffect(() => {
    ;(async () => {
      try {
        const raw = localStorage.getItem('existing_member_delegate')
        if (raw) {
          const data = JSON.parse(raw)
          setDelegate(data)
          const cat = mapCategory(data?.details?.pin_category || data?.details?.pin_cat)
          if (cat) setCategory(cat)
          setShowUpgradeModal(Boolean(data?.upgraded) && !((query.get('upgrade') || '') === '1'))
          setShowRegisteredModal(Boolean(data?.alreadyRegistered))
          return
        }
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
            localStorage.setItem('existing_member_delegate', JSON.stringify(res.delegate))
            setDelegate(res.delegate)
            const cat = mapCategory(res.delegate?.details?.pin_category || res.delegate?.details?.pin_cat)
            if (cat) setCategory(cat)
            setShowUpgradeModal(Boolean(res.delegate?.upgraded) && !((query.get('upgrade') || '') === '1'))
            setShowRegisteredModal(Boolean(res.delegate?.alreadyRegistered))
          } else {
            navigate('/existing/validate')
          }
        } else {
          navigate('/existing/validate')
        }
      } catch {
        navigate('/existing/validate')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const refs = {
    personal: useRef(null),
    contact: useRef(null),
    emergency: useRef(null),
    details: useRef(null),
    education: useRef(null),
    membership: useRef(null),
  }

  useEffect(() => {
    ;(async () => {
      const [ms, hq] = await Promise.all([
        fetchMaritalStatuses(),
        fetchHighestQualifications(),
      ])
      setMaritalStatuses(ms)
      setQualifications(hq)
    })()
  }, [])

  useEffect(() => {
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

  useEffect(() => {
    const det = delegate?.details
    if (!det) return
    const normalize = (v) => (v == null ? '' : String(v).trim())
    setVCouncil(normalize(det.area_council))
    setVBranch(normalize(det.branch))
    setVState(normalize(det.state_of_origin))
    if (rules.school.mode !== 'text') setVSchool(normalize(det.school))
    setVClassLevel(normalize(det.class_level))
    setVCourse(normalize(det.course))
    const rawA = normalize(det.ailments)
    const arrA = rawA && rawA.toLowerCase() !== 'none' ? rawA.split(',').map((s) => s.trim()).filter(Boolean) : []
    setVAilments(arrA)
  }, [delegate, category])

  const rules = {
    email: category === 'Undergraduate' || category === 'Others' ? { visible: true, required: true } : { visible: category !== 'TFL' && category !== 'Secondary', required: false },
    phone: category === 'TFL' ? { visible: false, required: false } : { visible: true, required: true },
    maritalStatus: category === 'Undergraduate' || category === 'Others' ? { visible: true, required: true } : { visible: false, required: false, defaultValue: 'Single' },
    nextOfKin: category === 'TFL' ? { visible: false, required: false } : { visible: true, required: true },
    nextOfKinPhone: category === 'TFL' ? { visible: false, required: false } : { visible: true, required: true },
    course: category === 'Undergraduate' || category === 'Others' ? { visible: true, required: true } : { visible: false, required: false },
    highestQualification: category === 'TFL' ? { visible: false, required: false } : { visible: true, required: true },
    discipline: category === 'Undergraduate' || category === 'Others' ? { visible: true, required: true } : { visible: false, required: false },
    organisation: category === 'TFL' ? { visible: false, required: false } : { visible: true, required: false },
    school: category === 'TFL' ? { mode: 'text' } : { mode: 'select' },
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    alert('Submitted. Connect database to complete registration and payment.')
  }

  const jumpTo = (id) => {
    const el = refs[id]?.current
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const labelClass = 'text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-mssn-slate/70'
  const inputClass = 'mt-2 w-full rounded-xl border border-mssn-slate/20 bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2 focus:border-mssn-green focus:ring-mssn-green/25'
  const inputDisabledClass = 'cursor-not-allowed bg-mssn-mist text-mssn-slate/50'

  const d = delegate?.details || {}
  const genderDisplay = d?.sex ? (String(d.sex).trim().toLowerCase() === 'male' ? 'Male' : (String(d.sex).trim().toLowerCase() === 'female' ? 'Female' : d.sex)) : ''

  const toInfo = delegate?.upgrade_details?.[0]?.to || {}
  const targetPin = String(toInfo?.pin_category || '').toUpperCase()
  const targetCategory = targetPin === 'UNDERGRADUATE' ? 'undergraduate' : (targetPin === 'SECONDARY' || targetPin === 'TFL') ? 'secondary' : (targetPin ? 'others' : '')
  const currentCategoryLower = category === 'Undergraduate' ? 'undergraduate' : category === 'Secondary' ? 'secondary' : category === 'Others' ? 'others' : ''
  const categoryKey = targetCategory || currentCategoryLower || 'secondary'

  const schoolIdentifier = categoryKey === 'secondary' ? 'S' : categoryKey === 'undergraduate' ? 'U' : 'U'
  const classIdentifier = categoryKey === 'secondary' ? 'S' : categoryKey === 'undergraduate' ? 'U' : 'O'

  const buildPrefill = () => {
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
      next_of_kin: d.next_of_kin || '',
      next_of_kin_tel: d.next_of_kin_tel || '',
      discipline: d.discipline || '',
      workplace: d.workplace || ''
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      {showUpgradeModal ? null : (
        <div className="rounded-3xl border border-mssn-slate/10 bg-white">
          
          <div className="bg-radial-glow/40">
            <div className="flex flex-col gap-2 px-6 pt-8 sm:flex-row sm:items-start sm:justify-between sm:px-10">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">Existing Member</span>
                <h1 className="mt-2 text-3xl font-semibold text-mssn-slate">Edit</h1>
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
                initialValues={buildPrefill()}
                validationSchema={buildValidationSchemaEM({
                  showCourse: categoryKey === 'undergraduate' || categoryKey === 'others',
                  showDiscipline: categoryKey === 'undergraduate' || categoryKey === 'others',
                  showWorkplace: categoryKey === 'undergraduate' || categoryKey === 'others',
                  showEmergency: categoryKey === 'undergraduate' || categoryKey === 'others',
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
                    payload.discipline = normalize(values.discipline)
                    payload.workplace = normalize(values.workplace)
                  }
                  Object.keys(payload).forEach((key) => { if (payload[key] === undefined) delete payload[key] })
                  try {
                    const res = await fetchJSON('/registration/new', {
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
                      window.location.href = data.redirect_url
                    } else {
                      navigate('/registration')
                    }
                  } catch (_) {
                  } finally {
                    helpers.setSubmitting(false)
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
                      <button type="submit" disabled={!formik.isValid || formik.isSubmitting} className={`inline-flex items-center justify-center rounded-2xl px-8 py-3 text-sm font-semibold transition ${formik.isValid ? 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white hover:from-mssn-greenDark hover:to-mssn-greenDark' : 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60'}`}>
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

    {showRegisteredModal && (
      <div className="fixed inset-0 z-[1001] grid place-items-center bg-black/40">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-mssn-slate">Already Registered</h3>
          <p className="mt-2 text-sm text-mssn-slate/70">Our records show you have already registered. Would you like to re‑print your slip?</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => { setShowRegisteredModal(false) }} className="rounded-xl border border-mssn-slate/20 px-4 py-2 text-sm font-semibold text-mssn-slate">Continue Editing</button>
            <button type="button" onClick={() => navigate('/registration')} className="rounded-xl bg-mssn-green px-4 py-2 text-sm font-semibold text-white">Re‑print Slip</button>
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
            <button type="button" onClick={() => setShowUpgradeModal(false)} className="rounded-xl border border-mssn-slate/20 px-4 py-2 text-sm font-semibold text-mssn-slate">Close</button>
            <button type="button" onClick={() => { setUpgradeStarted(true); setShowUpgradeModal(false) }} className="rounded-xl bg-mssn-green px-4 py-2 text-sm font-semibold text-white">Start Upgrade</button>
          </div>
        </div>
      </div>
    )}
  </section>
  )
}
