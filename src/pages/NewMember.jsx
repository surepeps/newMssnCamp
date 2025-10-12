import { useEffect, useMemo, useRef, useState } from 'react'
import { navigate } from '../utils/navigation.js'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { queryStates, queryAilments, queryCouncils, querySchools, queryClassLevels, queryCourses, queryQualifications, fetchHighestQualifications } from '../services/dataProvider.js'
import { fetchJSON } from '../services/api.js'
import { toast } from 'sonner'
import ProcessingModal from '../components/ProcessingModal.jsx'
import { useSettings } from '../context/SettingsContext.jsx'

const CATEGORIES = ['secondary', 'undergraduate', 'others']

const CATEGORY_CONFIG = {
  secondary: {
    label: 'Secondary',
    schoolIdentifier: 'S',
    classIdentifier: 'S',
    showSchool: true,
    showClassLevel: true,
    schoolPlaceholder: 'Select school...',
    classPlaceholder: 'Select class level...'
  },
  undergraduate: {
    label: 'Undergraduate',
    schoolIdentifier: 'U',
    classIdentifier: 'U',
    showSchool: true,
    showClassLevel: true,
    schoolPlaceholder: 'Select institution...',
    classPlaceholder: 'Select level...'
  },
  others: {
    label: 'Others',
    schoolIdentifier: 'U',
    classIdentifier: 'O',
    showSchool: true,
    showClassLevel: true,
    schoolPlaceholder: 'Select institution...',
    classPlaceholder: 'Select level...'
  }
}

const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed']

const DRAFT_KEY = 'new_member_draft'

function CategoryCard({ id, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full flex-col justify-between rounded-3xl border border-mssn-slate/10 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-mssn-green/40"
      aria-label={`Select ${title}`}
    >
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-mssn-slate">{title}</h2>
        <p className="text-sm text-mssn-slate/70">{description}</p>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-mssn-greenDark">
        Choose <span aria-hidden>→</span>
      </span>
    </button>
  )
}

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

function useDebouncedValue(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}

function AsyncSelect({
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  disabled = false,
  fetchPage,
  onBlur,
  invalid = false,
}) {
  const containerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const prevOpen = useRef(false)

  const normalizedValue = multiple ? (Array.isArray(value) ? value.filter(Boolean) : []) : (value || '')
  const selectedLabels = useMemo(() => {
    if (multiple) return normalizedValue
    return normalizedValue ? [normalizedValue] : []
  }, [multiple, normalizedValue])

  const hasMore = page < totalPages

  const load = async (reset = false) => {
    if (loading || disabled) return
    setLoading(true)
    try {
      const targetPage = reset ? 1 : page + (items.length ? 1 : 0)
      const res = await fetchPage({ page: targetPage, search: debouncedSearch.trim() })
      const newItems = res.items || []
      setItems((prev) => (reset ? newItems : [...prev, ...newItems]))
      setPage(res.page || targetPage)
      setTotalPages(res.totalPages || targetPage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setItems([])
      setPage(1)
      setTotalPages(1)
      load(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debouncedSearch])

  useEffect(() => {
    if (prevOpen.current && !open) {
      onBlur?.()
    }
    prevOpen.current = open
  }, [open, onBlur])

  useOutsideClick(containerRef, () => setOpen(false))

  const onOptionClick = (opt) => {
    if (multiple) {
      const set = new Set(normalizedValue)
      if (set.has(opt.label)) set.delete(opt.label)
      else set.add(opt.label)
      onChange(Array.from(set))
      onBlur?.()
    } else {
      onChange(opt.label)
      setOpen(false)
    }
  }

  const isSelected = (opt) => {
    return multiple ? normalizedValue.includes(opt.label) : normalizedValue === opt.label
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 ${invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 hover:border-mssn-green/40 focus:border-mssn-green focus:ring-mssn-green/25'} ${disabled ? 'cursor-not-allowed bg-mssn-mist text-mssn-slate/50' : 'bg-white text-mssn-slate'}`}
      >
        {selectedLabels.length ? (
          multiple ? (
            <span className="flex flex-wrap gap-1">
              {selectedLabels.map((l, i) => (
                <span key={`${l}-${i}`} className="inline-flex items-center gap-1 rounded-xl bg-mssn-mist px-2 py-0.5 text-xs text-mssn-slate">
                  <span>{l}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${l}`}
                    className="rounded-full p-0.5 text-mssn-slate/60 hover:bg-mssn-slate/10 hover:text-mssn-slate"
                    onClick={(e) => {
                      e.stopPropagation()
                      const next = normalizedValue.filter((v) => v !== l)
                      onChange(next)
                      onBlur?.()
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </span>
          ) : (
            <span>{selectedLabels[0]}</span>
          )
        ) : (
          <span className="text-mssn-slate/40">{placeholder}</span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-visible rounded-xl border border-mssn-slate/10 bg-white">
          <div className="p-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-mssn-green/30"
            />
          </div>
          <div
            className="max-h-60 overflow-auto"
            onScroll={(e) => {
              const el = e.currentTarget
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24 && hasMore && !loading) {
                load(false)
              }
            }}
          >
            {items.map((opt) => (
              <button
                type="button"
                key={String(opt.value)}
                onClick={() => onOptionClick(opt)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-mssn-mist ${isSelected(opt) ? 'bg-mssn-mist' : ''}`}
              >
                <span>{opt.label}</span>
                {isSelected(opt) && <span className="text-mssn-greenDark">✓</span>}
              </button>
            ))}
            {loading && <div className="px-3 py-2 text-xs text-mssn-slate/60">Loading…</div>}
            {!loading && !items.length && <div className="px-3 py-6 text-center text-xs text-mssn-slate/60">No results</div>}
          </div>
        </div>
      )}
    </div>
  )
}

function FieldShell({ label, required, error, htmlFor, children, className }) {
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

function TextField({ formik, name, label, type = 'text', required = false, placeholder, as, rows = 3, className }) {
  const error = formik.touched[name] && formik.errors[name]
  const id = `${name}-field`
  const val = formik.values[name]
  const isEmpty = (v) => (v == null ? true : typeof v === 'string' ? v.trim().length === 0 : false)
  const invalid = (required && isEmpty(val)) || (!!error)
  const baseClass = `w-full rounded-xl border ${invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-mssn-slate/20 focus:border-mssn-green focus:ring-mssn-green/25'} bg-white px-4 py-3 text-sm text-mssn-slate transition focus:outline-none focus:ring-2`

  return (
    <FieldShell label={label} required={required} error={error} htmlFor={id} className={className}>
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
    </FieldShell>
  )
}

function SelectField({ formik, name, label, options, required = false, placeholder = 'Select...', className }) {
  const error = formik.touched[name] && formik.errors[name]
  const id = `${name}-select`
  const value = formik.values[name]
  const invalid = (required && (!value || String(value).trim() === '')) || (!!error)
  return (
    <FieldShell label={label} required={required} error={error} htmlFor={id} className={className}>
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
    </FieldShell>
  )
}

function FormikAsyncSelect({ formik, name, label, required = false, className, ...props }) {
  const error = formik.touched[name] && formik.errors[name]
  const val = formik.values[name]
  const isEmpty = Array.isArray(val) ? val.length === 0 : !val || String(val).trim() === ''
  const invalid = (required && isEmpty) || (!!error)
  return (
    <FieldShell label={label} required={required} error={error} className={className}>
      <AsyncSelect
        {...props}
        value={formik.values[name]}
        onChange={(val) => formik.setFieldValue(name, val)}
        onBlur={() => formik.setFieldTouched(name, true)}
        invalid={invalid}
      />
    </FieldShell>
  )
}

function SectionCard({ title, description, columns = 'sm:grid-cols-2', children }) {
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

function buildValidationSchema(config, extras = {}) {
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
  if (extras.showEmergency) {
    shape.next_of_kin = optionalString.nullable()
    shape.next_of_kin_tel = optionalString.nullable()
  }
  if (extras.showCourse) {
    shape.course = optionalString.nullable()
  }
  if (extras.showHighestQualification) {
    shape.highest_qualification = optionalString.nullable().required('Required')
  }
  if (extras.showDiscipline) {
    shape.discipline = optionalString.nullable()
  }
  if (extras.showWorkplace) {
    shape.workplace = optionalString.nullable()
  }
  return Yup.object(shape)
}

function DraftSaver({ formik, category }) {
  const debounced = useDebouncedValue(formik.values, 400)
  useEffect(() => {
    try {
      const values = debounced || {}
      const hasAnyFilled = Object.entries(values).some(([key, rawValue]) => {
        if (rawValue == null) return false
        if (Array.isArray(rawValue)) {
          return rawValue.some((item) => {
            if (item == null) return false
            if (typeof item === 'string') return item.trim().length > 0
            return Boolean(item)
          })
        }
        if (typeof rawValue === 'string') {
          const trimmed = rawValue.trim()
          if (!trimmed) return false
          if (key === 'marital_status' && trimmed.toLowerCase() === 'single') return false
          return true
        }
        if (typeof rawValue === 'number') {
          return !Number.isNaN(rawValue)
        }
        if (typeof rawValue === 'object') {
          return Object.keys(rawValue).length > 0
        }
        return Boolean(rawValue)
      })
      if (hasAnyFilled) {
        const payload = { category, values, updatedAt: Date.now() }
        localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
      } else {
        localStorage.removeItem(DRAFT_KEY)
      }
    } catch {}
  }, [debounced, category])
  return null
}

export function RegistrationForm({ category, prefillValues, submitLabel, enableDraft = true, onSubmit: onSubmitOverride }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.secondary

  const maritalOptions = category === 'secondary' ? ['Single'] : MARITAL_OPTIONS

  const isUG = category === 'undergraduate'
  const isOthers = category === 'others'
  const showCourse = isUG || isOthers
  const showDiscipline = isUG || isOthers
  const showWorkplace = isUG || isOthers
  const showEmergency = isUG || isOthers
  const showHighestQualification = isUG || isOthers

  const { settings } = useSettings()
  const camp = settings?.current_camp
  const priceOriginal = category === 'undergraduate' ? camp?.prices?.undergraduate : category === 'secondary' ? camp?.prices?.secondary : category === 'others' ? camp?.prices?.others : null
  const priceDiscounted = category === 'undergraduate' ? camp?.discounts?.price_und : category === 'secondary' ? camp?.discounts?.price_sec : category === 'others' ? camp?.discounts?.price_oth : null
  const finalPrice = (priceDiscounted != null && priceOriginal != null && Number(priceDiscounted) < Number(priceOriginal)) ? priceDiscounted : priceOriginal

  const [qualifications, setQualifications] = useState([])
  const qualificationAudience = isUG ? 'Undergraduate' : (isOthers ? 'Others' : '')
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const list = await fetchHighestQualifications()
        if (!cancelled) setQualifications(Array.isArray(list) ? list : [])
      } catch {
        if (!cancelled) setQualifications([])
      }
    }
    if (qualificationAudience) load()
    else setQualifications([])
    return () => { cancelled = true }
  }, [qualificationAudience])

  const initialValues = useMemo(() => {
    const base = {
      surname: '',
      firstname: '',
      othername: '',
      sex: '',
      date_of_birth: '',
      area_council: '',
      branch: '',
      email: '',
      tel_no: '',
      resident_address: '',
      marital_status: 'Single',
      state_of_origin: '',
      school: '',
      class_level: '',
      ailments: [],
      course: '',
      highest_qualification: '',
      next_of_kin: '',
      next_of_kin_tel: '',
      discipline: '',
      workplace: ''
    }
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft && draft.category === category && draft.values && typeof draft.values === 'object') {
          const merged = { ...base, ...draft.values }
          return prefillValues && typeof prefillValues === 'object' ? { ...merged, ...prefillValues } : merged
        }
      }
    } catch {}
    return prefillValues && typeof prefillValues === 'object' ? { ...base, ...prefillValues } : base
  }, [category, prefillValues])

  const validationSchema = useMemo(() => buildValidationSchema(config, { showCourse, showDiscipline, showWorkplace, showEmergency, showHighestQualification }), [config, showCourse, showDiscipline, showWorkplace, showEmergency, showHighestQualification])

  const [processing, setProcessing] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const handleSubmit = async (values, helpers) => {
    if (typeof onSubmitOverride === 'function') {
      onSubmitOverride(values, helpers, { category })
      return
    }
    const normalize = (input) => {
      if (Array.isArray(input)) return input.filter(Boolean)
      if (typeof input === 'string') {
        const trimmed = input.trim()
        return trimmed.length ? trimmed : undefined
      }
      return input === undefined || input === null ? undefined : input
    }

    const categoryApi = category === 'undergraduate' ? 'UNDERGRADUATE' : category === 'secondary' ? 'SECONDARY' : 'OTHERS'

    const payload = {
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
      pin_category: categoryApi
    }

    if (config.showSchool) {
      payload.school = normalize(values.school)
    }
    if (config.showClassLevel) {
      payload.class_level = normalize(values.class_level)
    }
    if (showEmergency) {
      payload.next_of_kin = normalize(values.next_of_kin)
      payload.next_of_kin_tel = normalize(values.next_of_kin_tel)
    }
    if (showCourse) {
      payload.course = normalize(values.course)
    }
    if (showHighestQualification) {
      payload.highest_qualification = normalize(values.highest_qualification)
    }
    if (showDiscipline) {
      payload.discipline = normalize(values.discipline)
    }
    if (showWorkplace) {
      payload.workplace = normalize(values.workplace)
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key]
    })

    try {
      setProcessing(true)
      const res = await fetchJSON('/registration/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = res?.data || {}
      const message = data.message || res?.message || 'Registered successfully'
      const priceInfo = typeof data.price !== 'undefined' ? ` • ₦${Number(data.price).toFixed(2)}` : ''
      const discount = data.discount_applied ? ' • discount applied' : ''
      toast.success(`${message}${priceInfo}${discount}`)
      try { localStorage.removeItem(DRAFT_KEY) } catch {}
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
    } catch (err) {
      // Error toast handled globally in fetchJSON
    } finally {
      helpers.setSubmitting(false)
      setProcessing(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="bg-radial-glow/40 rounded-3xl">
          <div className="flex flex-col gap-4 px-6 pt-8 sm:flex-row sm:items-start sm:justify-between sm:px-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">New Member</span>
              <h1 className="mt-2 text-3xl font-semibold text-mssn-slate">{config.label}</h1>
            </div>
            <div className="flex items-center gap-3">
              {finalPrice != null ? (
                <span className="inline-flex items-center rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold text-mssn-greenDark">Amount: ₦{Number(finalPrice).toFixed(2)}</span>
              ) : null}
              <a href="/new" onClick={(e) => { e.preventDefault(); navigate('/new'); }} className="inline-flex items-center text-sm font-semibold text-mssn-greenDark transition hover:text-mssn-green">
                Change category
              </a>
            </div>
          </div>

        </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
            validateOnMount
          >
            {(formik) => (
              <Form className="mt-10 space-y-10 px-6 pb-10 sm:px-10">
                <input type="hidden" name="pin_category" value={category} />

                <SectionCard title="Personal details" description="Tell us a little about who you are.">
                  <TextField formik={formik} name="surname" label="Surname" required placeholder="Enter surname" />
                  <TextField formik={formik} name="firstname" label="Firstname" required placeholder="Enter firstname" />
                  <SelectField
                    formik={formik}
                    name="sex"
                    label="Gender"
                    required
                    options={['Male', 'Female']}
                    placeholder="Select gender"
                  />
                  <TextField
                    formik={formik}
                    name="date_of_birth"
                    label="Age"
                    type="number"
                    required
                    placeholder="Enter age"
                  />
                  <TextField formik={formik} name="othername" label="Othername" placeholder="Enter other names" className="sm:col-span-2" />
                </SectionCard>

                <SectionCard title="Contact & location" description="How can we reach you and where are you based?" columns="sm:grid-cols-2">
                  <FormikAsyncSelect
                    formik={formik}
                    name="area_council"
                    label="Area Council"
                    required
                    placeholder="Select council..."
                    fetchPage={({ page, search }) => queryCouncils({ page, limit: 20, search })}
                  />
                  <TextField
                    formik={formik}
                    name="branch"
                    label="Branch"
                    required
                    placeholder="Enter branch name"
                  />
                  <TextField formik={formik} name="email" label="Email" type="email" placeholder="name@email.com" />
                  <TextField formik={formik} name="tel_no" label="Phone Number" placeholder="Enter phone number" />
                  <TextField
                    formik={formik}
                    name="resident_address"
                    label="Resident Address"
                    as="textarea"
                    rows={3}
                    placeholder="Enter residential address"
                    className="sm:col-span-2"
                  />
                  <SelectField
                    formik={formik}
                    name="marital_status"
                    label="Marital Status"
                    options={maritalOptions}
                    placeholder="Select status"
                  />
                  <FormikAsyncSelect
                    formik={formik}
                    name="state_of_origin"
                    label="State of Origin"
                    placeholder="Select state..."
                    fetchPage={({ page, search }) => queryStates({ page, limit: 20, search })}
                  />
                </SectionCard>

                {(config.showSchool || config.showClassLevel || showCourse || showDiscipline || showWorkplace) ? (
                  <SectionCard title="Education & Occupation" description="Share your institution and occupation details.">
                    {config.showSchool ? (
                      <FormikAsyncSelect
                        formik={formik}
                        name="school"
                        label="School"
                        placeholder={config.schoolPlaceholder}
                        fetchPage={({ page, search }) => querySchools({ identifier: config.schoolIdentifier, page, limit: 20, search })}
                      />
                    ) : null}
                    {config.showClassLevel ? (
                      <FormikAsyncSelect
                        formik={formik}
                        name="class_level"
                        label="Class Level"
                        placeholder={config.classPlaceholder}
                        fetchPage={({ page, search }) => queryClassLevels({ identifier: config.classIdentifier, page, limit: 20, search })}
                      />
                    ) : null}
                    {showCourse ? (
                      <FormikAsyncSelect
                        formik={formik}
                        name="course"
                        label="Course"
                        placeholder="Select course..."
                        fetchPage={({ page, search }) => queryCourses({ page, limit: 20, search })}
                      />
                    ) : null}
                    {showHighestQualification ? (
                      <FormikAsyncSelect
                        formik={formik}
                        name="highest_qualification"
                        label="Highest Qualification"
                        required
                        placeholder="Select qualification..."
                        fetchPage={({ page, search }) => queryQualifications({ page, limit: 20, search })}
                      />
                    ) : null}
                    {showDiscipline ? (
                      <TextField formik={formik} name="discipline" label="Discipline / Occupation" placeholder="Enter discipline or occupation" />
                    ) : null}
                    {showWorkplace ? (
                      <TextField formik={formik} name="workplace" label="Workplace" placeholder="Enter workplace (optional)" className="sm:col-span-2" />
                    ) : null}
                  </SectionCard>
                ) : null}

                {showEmergency ? (
                  <SectionCard title="Emergency Contact" description="Who should we contact in case of emergency?" columns="sm:grid-cols-2">
                    <TextField formik={formik} name="next_of_kin" label="Next of Kin" placeholder="Enter next of kin" />
                    <TextField formik={formik} name="next_of_kin_tel" label="Next of Kin Phone" placeholder="Enter phone number" />
                  </SectionCard>
                ) : null}

                <SectionCard title="Health" description="Let us know of any ailments so we can support you." columns="sm:grid-cols-2">
                  <FormikAsyncSelect
                    formik={formik}
                    name="ailments"
                    label="Ailments"
                    multiple
                    placeholder="Select ailments..."
                    fetchPage={({ page, search }) => queryAilments({ page, limit: 20, search })}
                    className="sm:col-span-2"
                  />
                </SectionCard>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={!formik.isValid || formik.isSubmitting}
                    className={`inline-flex items-center justify-center rounded-2xl px-8 py-3 text-sm font-semibold transition ${formik.isValid ? 'bg-mssn-green cursor-pointer text-white hover:from-mssn-greenDark hover:to-mssn-greenDark cursor-pointer' : 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60'}`}
                  >
                    {formik.isSubmitting ? 'Submitting…' : (submitLabel || 'Continue to Payment')}
                  </button>
                  <a
                    href="/"
                    onClick={(e) => { e.preventDefault(); try { localStorage.removeItem(DRAFT_KEY) } catch {} formik.resetForm(); navigate('/new') }}
                    className="inline-flex items-center justify-center rounded-2xl border border-mssn-slate/20 px-8 py-3 text-sm font-semibold text-mssn-slate transition hover:border-mssn-green/40 hover:text-mssn-greenDark"
                  >
                    Cancel
                  </a>
                </div>
                {enableDraft !== false ? <DraftSaver formik={formik} category={category} /> : null}
              </Form>
            )}
          </Formik>
      <ProcessingModal visible={processing} title="Processing payment…" subtitle="Please wait while we submit your registration and prepare payment." />
      <ProcessingModal visible={redirecting} title="Redirecting to payment…" subtitle="Please hold on while we redirect you to the payment page." />
      </div>
    </section>
  )
}

export default function NewMember({ category }) {
  const [draft, setDraft] = useState(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) setDraft(JSON.parse(raw))
    } catch {}
  }, [])

  if (!category || !CATEGORIES.includes(category)) {
    const resumeCategory = draft?.category && CATEGORIES.includes(draft.category) ? draft.category : null
    const resumeName = draft?.values?.surname || draft?.values?.firstname ? `${draft?.values?.surname ?? ''} ${draft?.values?.firstname ?? ''}`.trim() : null
    return (
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="rounded-4xl bg-white p-6 ring-1 ring-mssn-slate/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">New Member</span>
              <h2 className="mt-2 text-2xl font-semibold text-mssn-slate">Select your category</h2>
            </div>
          </div>
          {resumeCategory ? (
            <div className="mt-5 rounded-3xl border border-mssn-green/30 bg-mssn-green/10 p-4 text-sm text-mssn-slate">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">You have a pending registration</p>
                  <p className="text-mssn-slate/70">{resumeName ? `${resumeName} • ` : ''}{CATEGORY_CONFIG[resumeCategory].label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => navigate(`/new/${resumeCategory}`)} className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-white">
                    Continue
                  </button>
                  <button type="button" onClick={() => { try { localStorage.removeItem(DRAFT_KEY) } catch {} setDraft(null) }} className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 text-rose-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <div className="mt-5 grid gap-6 lg:grid-cols-3">
            <CategoryCard id="secondary" title="Secondary" description="For junior and senior secondary students." onClick={() => { navigate('/new/secondary') }} />
            <CategoryCard id="undergraduate" title="Undergraduate" description="For admission seekers, university, polytechnic, and college students." onClick={() => { navigate('/new/undergraduate') }} />
            <CategoryCard id="others" title="Others" description="For workers, professionals, and other non-student participants." onClick={() => { navigate('/new/others') }} />
          </div>
        </div>
      </section>
    )
  }

  return <RegistrationForm category={category} />
}
