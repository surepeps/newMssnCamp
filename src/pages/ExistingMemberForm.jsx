import { useEffect, useMemo, useRef, useState } from 'react'
import StepProgress from '../components/StepProgress.jsx'
import {
  fetchStates,
  fetchMaritalStatuses,
  fetchCourses,
  fetchHighestQualifications,
  fetchAilments,
  fetchCouncils,
  fetchBranches,
  fetchSchoolsSecondary,
  fetchSchoolsUndergrad,
  fetchClassLevels,
} from '../services/dataProvider.js'

const CATEGORY_OPTIONS = ['TFL', 'Secondary', 'Undergraduate', 'Others']

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), [])
}

function HiddenInput({ name, value }) {
  return <input type="hidden" name={name} value={value} />
}

function SectionNav({ active, onJump }) {
  const sections = [
    { id: 'personal', label: 'Personal' },
    { id: 'contact', label: 'Contact' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'details', label: 'Details' },
    { id: 'education', label: 'Education' },
    { id: 'membership', label: 'Membership' },
  ]
  return (
    <nav className="sticky top-20 lg:top-24 z-10 -mx-2 flex gap-2 overflow-x-auto px-2 py-2 backdrop-blur">
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onJump(s.id)}
          className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            active === s.id ? 'border-mssn-green/50 bg-mssn-green/10 text-mssn-greenDark' : 'border-mssn-slate/20 bg-white text-mssn-slate'
          }`}
        >
          {s.label}
        </button>
      ))}
    </nav>
  )
}

function CategoryHints({ rules }) {
  const hidden = []
  if (!rules.email.visible) hidden.push('Email')
  if (!rules.phone.visible) hidden.push('Phone')
  if (!rules.maritalStatus.visible) hidden.push('Marital Status')
  if (!rules.nextOfKin.visible) hidden.push('Next of Kin')
  if (!rules.nextOfKinPhone.visible) hidden.push('Next of Kin Phone')
  if (!rules.course.visible) hidden.push('Course')
  if (!rules.highestQualification.visible) hidden.push('Highest Qualification')
  if (!rules.discipline.visible) hidden.push('Discipline / Occupation')
  if (!rules.organisation.visible) hidden.push('Organisation')
  return (
    <div className="rounded-2xl border border-mssn-slate/10 bg-mssn-mist/60 p-4 text-xs text-mssn-slate/80">
      <div className="font-semibold text-mssn-slate">Field visibility</div>
      {hidden.length ? (
        <p className="mt-1">Automatically hidden: {hidden.join(', ')}.</p>
      ) : (
        <p className="mt-1">All fields visible for this category.</p>
      )}
    </div>
  )
}

function SectionCard({ title, description, columns = 'sm:grid-cols-2', children }) {
  return (
    <div className="rounded-3xl bg-white/90 p-6 sm:p-8">
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

export default function ExistingMemberForm() {
  const query = useQuery()
  const [category, setCategory] = useState('')
  const [delegate, setDelegate] = useState(null)
  const [states, setStates] = useState([])
  const [maritalStatuses, setMaritalStatuses] = useState([])
  const [courses, setCourses] = useState([])
  const [qualifications, setQualifications] = useState([])
  const [ailments, setAilments] = useState([])
  const [councils, setCouncils] = useState([])
  const [branches, setBranches] = useState([])
  const [schoolsSec, setSchoolsSec] = useState([])
  const [schoolsUnd, setSchoolsUnd] = useState([])
  const [classLevels, setClassLevels] = useState([])
  const [activeSection, setActiveSection] = useState('personal')

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
    try {
      const raw = localStorage.getItem('existing_member_delegate')
      if (raw) {
        const data = JSON.parse(raw)
        setDelegate(data)
        const cat = mapCategory(data?.details?.pin_category || data?.details?.pin_cat)
        if (cat) setCategory(cat)
      }
    } catch {}
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
      const [st, ms, crs, hq, al, co, br, ss, su] = await Promise.all([
        fetchStates(),
        fetchMaritalStatuses(),
        fetchCourses(),
        fetchHighestQualifications(),
        fetchAilments(),
        fetchCouncils(),
        fetchBranches(),
        fetchSchoolsSecondary(),
        fetchSchoolsUndergrad(),
      ])
      setStates(st)
      setMaritalStatuses(ms)
      setCourses(crs)
      setQualifications(hq)
      setAilments(al)
      setCouncils(co)
      setBranches(br)
      setSchoolsSec(ss)
      setSchoolsUnd(su)
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      const levels = await fetchClassLevels(category)
      setClassLevels(levels)
    })()
  }, [category])

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

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-6">
        <StepProgress steps={["Validate", "Edit", "Pay"]} current={1} />
      </div>
      <div className="rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
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
            </div>
          </div>

          <div className="px-6 pb-10 pt-6 sm:px-10">
            <SectionNav active={activeSection} onJump={jumpTo} />
            <div className="mt-6 grid gap-6">
              <CategoryHints rules={rules} />
            </div>

            <form id="updForm" className="mt-6 space-y-10" data-parsley-validate onSubmit={onSubmit} noValidate>
              <div id="personal" ref={refs.personal}>
                <SectionCard title="Personal details" description="Tell us a little about who you are.">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Surname *</label>
                    </div>
                    <input name="surname" type="text" required placeholder="Enter surname" defaultValue={surname} className={inputClass} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Firstname *</label>
                    </div>
                    <input name="firstname" type="text" required placeholder="Enter firstname" className={inputClass} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Gender *</label>
                    </div>
                    <input name="gender" type="text" required readOnly placeholder="Gender" className={`${inputClass} ${inputDisabledClass}`} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Age *</label>
                    </div>
                    <input name="age" type="number" min="0" required placeholder="Enter age" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Othername</label>
                    </div>
                    <input name="othername" type="text" placeholder="Enter other names" className={inputClass} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Category *</label>
                    </div>
                    <select name="category" required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                      <option value="" disabled>Select category</option>
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Resident Address *</label>
                    </div>
                    <textarea name="address" required rows={3} placeholder="Enter residential address" className={`${inputClass} resize-none`}></textarea>
                  </div>
                </SectionCard>
              </div>

              <div id="contact" ref={refs.contact}>
                <SectionCard title="Contact & location" description="How can we reach you and where are you based?">
                  {rules.email.visible ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Email Address{rules.email.required ? ' *' : ''}</label>
                      </div>
                      <input name="email" type="email" required={rules.email.required} placeholder="name@email.com" className={inputClass} />
                    </div>
                  ) : (
                    <HiddenInput name="email" value="-------" />
                  )}

                  {rules.phone.visible ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Phone Number{rules.phone.required ? ' *' : ''}</label>
                      </div>
                      <input name="phone" type="text" required={rules.phone.required} placeholder="Enter phone number" className={inputClass} />
                    </div>
                  ) : (
                    <HiddenInput name="phone" value="-------" />
                  )}
                </SectionCard>
              </div>

              <div id="emergency" ref={refs.emergency}>
                <SectionCard title="Emergency Contact" description="Who should we contact in case of emergency?">
                  {rules.nextOfKin.visible ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Next of Kin{rules.nextOfKin.required ? ' *' : ''}</label>
                      </div>
                      <input name="nextOfKin" type="text" required={rules.nextOfKin.required} placeholder="Enter next of kin" className={inputClass} />
                    </div>
                  ) : (
                    <HiddenInput name="nextOfKin" value="------" />
                  )}

                  {rules.nextOfKinPhone.visible ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Next of Kin Phone Number{rules.nextOfKinPhone.required ? ' *' : ''}</label>
                      </div>
                      <input name="nextOfKinPhone" type="text" required={rules.nextOfKinPhone.required} placeholder="Enter phone number" className={inputClass} />
                    </div>
                  ) : (
                    <HiddenInput name="nextOfKinPhone" value="------" />
                  )}
                </SectionCard>
              </div>

              <div id="details" ref={refs.details}>
                <SectionCard title="Personal details" description="Additional personal information for records.">
                  {rules.maritalStatus.visible ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Marital Status{rules.maritalStatus.required ? ' *' : ''}</label>
                      </div>
                      <select name="maritalStatus" required={rules.maritalStatus.required} className={inputClass}>
                        <option value="" disabled>Select marital status</option>
                        {maritalStatuses.map((m) => (
                          <option key={m.value ?? m} value={m.value ?? m}>{m.label ?? m}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <HiddenInput name="maritalStatus" value={rules.maritalStatus.defaultValue || 'Single'} />
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>State of Origin *</label>
                    </div>
                    <select name="state" required className={inputClass}>
                      <option value="" disabled>Select state</option>
                      {states.map((s) => (
                        <option key={s.value ?? s} value={s.value ?? s}>{s.label ?? s}</option>
                      ))}
                    </select>
                  </div>
                </SectionCard>
              </div>

              <div id="education" ref={refs.education}>
                <SectionCard title="Education & Occupation" description="Share your institution and occupation details.">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>School *</label>
                    </div>
                    {rules.school.mode === 'text' ? (
                      <input name="school" type="text" required placeholder="Enter school name" className={inputClass} />
                    ) : (
                      <select name="school" required className={inputClass}>
                        <option value="" disabled>Select school</option>
                        {(category === 'Secondary' ? schoolsSec : schoolsUnd).map((s) => (
                          <option key={s.value ?? s} value={s.value ?? s}>{s.label ?? s}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Class Level *</label>
                    </div>
                    <select name="classLevel" required className={inputClass}>
                      <option value="" disabled>Select class level</option>
                      {classLevels.map((c) => (
                        <option key={c.value ?? c} value={c.value ?? c}>{c.label ?? c}</option>
                      ))}
                    </select>
                  </div>

                  {rules.course.visible ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Course{rules.course.required ? ' *' : ''}</label>
                      </div>
                      <select name="course" required={rules.course.required} className={inputClass}>
                        <option value="" disabled>Select course</option>
                        {courses.map((c) => (
                          <option key={c.value ?? c} value={c.value ?? c}>{c.label ?? c}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <HiddenInput name="course" value="------" />
                  )}

                  {rules.highestQualification.visible ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Highest Qualification{rules.highestQualification.required ? ' *' : ''}</label>
                      </div>
                      <select name="highestQualification" required={rules.highestQualification.required} className={inputClass}>
                        <option value="" disabled>Select highest qualification</option>
                        {qualifications.map((q) => (
                          <option key={q.value ?? q} value={q.value ?? q}>{q.label ?? q}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <HiddenInput name="highestQualification" value="------" />
                  )}

                  {rules.discipline.visible ? (
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Discipline / Occupation{rules.discipline.required ? ' *' : ''}</label>
                      </div>
                      <input name="discipline" type="text" required={rules.discipline.required} placeholder="Enter discipline or occupation" className={inputClass} />
                    </div>
                  ) : (
                    <HiddenInput name="discipline" value="------" />
                  )}

                  {rules.organisation.visible ? (
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Organisation / Workplace</label>
                      </div>
                      <input name="organisation" type="text" placeholder="Enter organisation / work place" className={inputClass} />
                    </div>
                  ) : (
                    <HiddenInput name="organisation" value="------" />
                  )}
                </SectionCard>
              </div>

              <div id="membership" ref={refs.membership}>
                <SectionCard title="MSSN Membership Details" description="Your council, branch and health details." columns="sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Area Council *</label>
                    </div>
                    <select name="council" required className={inputClass}>
                      <option value="" disabled>Select council</option>
                      {councils.map((c) => (
                        <option key={c.value ?? c} value={c.value ?? c}>{c.label ?? c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Branch *</label>
                    </div>
                    <select name="branch" required className={inputClass}>
                      <option value="" disabled>Select branch</option>
                      {branches.map((b) => (
                        <option key={b.value ?? b} value={b.value ?? b}>{b.label ?? b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Ailments *</label>
                    </div>
                    <select name="ailments" required className={inputClass}>
                      <option value="" disabled>Select ailment</option>
                      {ailments.map((a) => (
                        <option key={a.value ?? a} value={a.value ?? a}>{a.label ?? a}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Numbers of Camp Previously Attended</label>
                    </div>
                    <input name="previousCamps" type="text" readOnly placeholder="—" className={`${inputClass} ${inputDisabledClass}`} />
                  </div>
                </SectionCard>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-mssn-green to-mssn-greenDark px-8 py-3 text-sm font-semibold text-white transition hover:from-mssn-greenDark hover:to-mssn-greenDark">
                  Register & Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
