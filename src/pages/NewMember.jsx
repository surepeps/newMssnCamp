import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchStates, queryAilments, queryCouncils, querySchools, queryClassLevels } from '../services/dataProvider.js'

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
    schoolIdentifier: 'O',
    classIdentifier: 'O',
    showSchool: false,
    showClassLevel: false,
    schoolPlaceholder: '',
    classPlaceholder: ''
  }
}

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

function Label({ children, required }) {
  return <span className="text-xs text-mssn-slate/60">{children}{required ? ' *' : ''}</span>
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

function AsyncSelect({
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  disabled = false,
  fetchPage,
  displayValue
}) {
  const containerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const hasMore = page < totalPages

  const selectedLabels = useMemo(() => {
    if (multiple) {
      const map = new Map(items.map((it) => [String(it.value), it.label]))
      return (value || []).map((v) => map.get(String(v)) || String(v))
    } else {
      const found = items.find((it) => String(it.value) === String(value))
      if (found) return [found.label]
      if (displayValue) return [displayValue]
      return value ? [String(value)] : []
    }
  }, [items, value, multiple, displayValue])

  const load = async (reset = false) => {
    if (loading || disabled) return
    setLoading(true)
    try {
      const targetPage = reset ? 1 : page + (items.length ? 1 : 0)
      const res = await fetchPage({ page: targetPage, search })
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
  }, [open, search])

  useOutsideClick(containerRef, () => setOpen(false))

  const onOptionClick = (opt) => {
    if (multiple) {
      const set = new Set((value || []).map(String))
      const key = String(opt.value)
      if (set.has(key)) set.delete(key)
      else set.add(key)
      onChange(Array.from(set))
    } else {
      onChange(opt.value)
      setOpen(false)
    }
  }

  const isSelected = (opt) => {
    return multiple ? (value || []).map(String).includes(String(opt.value)) : String(value) === String(opt.value)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${disabled ? 'cursor-not-allowed bg-mssn-mist border-mssn-slate/20 text-mssn-slate/60' : 'bg-white border-mssn-slate/20 text-mssn-slate'}`}
      >
        {selectedLabels.length ? (
          multiple ? (
            <span className="flex flex-wrap gap-1">
              {selectedLabels.map((l, i) => (
                <span key={i} className="rounded-lg bg-mssn-mist px-2 py-0.5 text-xs text-mssn-slate">{l}</span>
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
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-mssn-slate/10 bg-white shadow-soft">
          <div className="p-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border border-mssn-slate/20 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-mssn-green/30"
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
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-mssn-mist ${isSelected(opt) ? 'bg-mssn-mist' : ''}`}
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

function RegistrationForm({ category }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.secondary
  const [surname, setSurname] = useState('')
  const [firstname, setFirstname] = useState('')
  const [othername, setOthername] = useState('')
  const [sex, setSex] = useState('')
  const [age, setAge] = useState('')
  const [areaCouncil, setAreaCouncil] = useState('')
  const [branch, setBranch] = useState('')
  const [email, setEmail] = useState('')
  const [tel, setTel] = useState('')
  const [address, setAddress] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [stateOrigin, setStateOrigin] = useState('')
  const [school, setSchool] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [ailments, setAilments] = useState([])
  const [stateOptions, setStateOptions] = useState([])
  const displayLabel = config.label

  useEffect(() => {
    ;(async () => {
      const states = await fetchStates()
      setStateOptions(states)
    })()
  }, [])

  const requiredOK =
    surname.trim() && firstname.trim() && sex && areaCouncil && branch && String(age).trim()

  const onSubmit = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    if (!requiredOK) return

    const payload = {
      surname,
      firstname,
      othername,
      sex,
      date_of_birth: String(age).trim(),
      area_council: areaCouncil,
      branch,
      email: email || undefined,
      tel_no: tel || undefined,
      resident_address: address || undefined,
      marital_status: maritalStatus || 'Single',
      state_of_origin: stateOrigin || undefined,
      ailments: ailments.join(','),
      pin_category: category
    }

    if (config.showSchool) {
      payload.school = school || undefined
    }
    if (config.showClassLevel) {
      payload.class_level = classLevel || undefined
    }

    try {
      const prev = JSON.parse(localStorage.getItem('new_member_submissions') || '[]')
      localStorage.setItem('new_member_submissions', JSON.stringify([...prev, payload]))
    } catch {}

    window.location.hash = '#/registration'
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="rounded-3xl border border-mssn-slate/10 bg-white shadow-soft">
        <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <form onSubmit={onSubmit} className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">New Member</span>
              <h1 className="text-2xl font-semibold capitalize text-mssn-slate">{displayLabel}</h1>
            </div>
            <a href="#/new" className="text-sm text-mssn-greenDark">Change</a>
          </div>

          <input type="hidden" name="pin_category" value={category} />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <Label required>Surname</Label>
              <input name="surname" value={surname} onChange={(e) => setSurname(e.target.value)} required className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <Label required>Firstname</Label>
              <input name="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} required className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <Label>Othername</Label>
              <input name="othername" value={othername} onChange={(e) => setOthername(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <Label required>Sex</Label>
              <select name="sex" value={sex} onChange={(e) => setSex(e.target.value)} required className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm">
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>

            <label className="block">
              <Label required>Date of Birth (Age)</Label>
              <input name="date_of_birth" type="number" min="1" value={age} onChange={(e) => setAge(e.target.value)} required className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>

            <label className="block">
              <Label required>Area Council</Label>
              <AsyncSelect
                value={areaCouncil}
                onChange={setAreaCouncil}
                placeholder="Select council..."
                fetchPage={({ page, search }) => queryCouncils({ page, limit: 20, search })}
              />
            </label>

            <label className="block">
              <Label required>Branch</Label>
              <AsyncSelect
                value={branch}
                onChange={setBranch}
                placeholder={areaCouncil ? 'Select branch...' : 'Select area council first'}
                disabled={!areaCouncil}
                fetchPage={({ page, search }) => Promise.resolve({ items: [], page, totalPages: 1 })}
              />
            </label>

            <label className="block">
              <Label>Email</Label>
              <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <Label>Phone Number</Label>
              <input name="tel_no" value={tel} onChange={(e) => setTel(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>

            <label className="block sm:col-span-2">
              <Label>Resident Address</Label>
              <input name="resident_address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>

            <label className="block">
              <Label>Marital Status</Label>
              <AsyncSelect
                value={maritalStatus}
                onChange={setMaritalStatus}
                placeholder="Single"
                fetchPage={({ page, search }) => {
                  const all = [{ value: 'Single', label: 'Single' }]
                  const filtered = all.filter((o) => o.label.toLowerCase().includes((search || '').toLowerCase()))
                  return Promise.resolve({ items: filtered, page: 1, totalPages: 1 })
                }}
              />
            </label>

            <label className="block">
              <Label>State of Origin</Label>
              <AsyncSelect
                value={stateOrigin}
                onChange={setStateOrigin}
                placeholder="Select state..."
                fetchPage={({ page, search }) => {
                  const pageSize = 25
                  const filtered = stateOptions.filter((s) => s.label.toLowerCase().includes((search || '').toLowerCase()))
                  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
                  const start = (page - 1) * pageSize
                  const items = filtered.slice(start, start + pageSize)
                  return Promise.resolve({ items, page, totalPages })
                }}
              />
            </label>

            {config.showSchool && (
              <label className="block sm:col-span-2">
                <Label>School</Label>
                <AsyncSelect
                  value={school}
                  onChange={setSchool}
                  placeholder={config.schoolPlaceholder}
                  fetchPage={({ page, search }) => querySchools({ identifier: config.schoolIdentifier, page, limit: 20, search })}
                />
              </label>
            )}

            {config.showClassLevel && (
              <label className="block">
                <Label>Class Level</Label>
                <AsyncSelect
                  value={classLevel}
                  onChange={setClassLevel}
                  placeholder={config.classPlaceholder}
                  fetchPage={({ page, search }) => queryClassLevels({ identifier: config.classIdentifier, page, limit: 20, search })}
                />
              </label>
            )}

            <label className="block sm:col-span-2">
              <Label>Ailments</Label>
              <AsyncSelect
                value={ailments}
                onChange={setAilments}
                multiple
                placeholder="Select ailments..."
                fetchPage={({ page, search }) => queryAilments({ page, limit: 20, search })}
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!requiredOK}
              className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${requiredOK ? 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white' : 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate'}`}
            >
              Continue to Registration
            </button>
            <a href="#/" className="inline-flex items-center justify-center rounded-full border border-mssn-slate/20 px-6 py-3 text-sm font-semibold text-mssn-slate">Cancel</a>
          </div>
        </form>
      </div>
    </section>
  )
}

export default function NewMember({ category }) {
  if (!category || !CATEGORIES.includes(category)) {
    return (
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="rounded-4xl bg-white p-6 ring-1 ring-mssn-slate/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-mssn-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-mssn-greenDark">New Member</span>
              <h2 className="mt-2 text-2xl font-semibold text-mssn-slate">Select your category</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-3">
            <CategoryCard id="secondary" title="Secondary" description="For junior and senior secondary students." onClick={() => { window.location.hash = '#/new/secondary' }} />
            <CategoryCard id="undergraduate" title="Undergraduate" description="For university, polytechnic and college students." onClick={() => { window.location.hash = '#/new/undergraduate' }} />
            <CategoryCard id="others" title="Others" description="For non-students and general participants." onClick={() => { window.location.hash = '#/new/others' }} />
          </div>
        </div>
      </section>
    )
  }

  return <RegistrationForm category={category} />
}
