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

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-6">
        <StepProgress steps={["Validate", "Edit", "Pay"]} current={1} />
      </div>
      <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold text-mssn-slate">Existing Member Registration</h1>
              <p className="text-sm text-mssn-slate/70">Review and edit your details. MSSN ID: <span className="font-semibold">{mssnId}</span>, Surname: <span className="font-semibold">{surname}</span></p>
            </div>
            <SectionNav active={activeSection} onJump={jumpTo} />
            <div className="grid gap-6">
              <CategoryHints rules={rules} />
              <form id="updForm" className="grid gap-10" data-parsley-validate onSubmit={onSubmit} noValidate>
                <div id="personal" ref={refs.personal} className="space-y-4">
                  <h2 className="text-lg font-semibold text-mssn-slate">Personal Information</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Surname</label>
                      <input name="surname" type="text" required placeholder="ENTER SURNAME" defaultValue={surname} className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Firstname</label>
                      <input name="firstname" type="text" required placeholder="ENTER FIRSTNAME" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Othername</label>
                      <input name="othername" type="text" required placeholder="ENTER OTHERNAME" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Gender</label>
                      <input name="gender" type="text" required readOnly placeholder="ENTER OTHERNAME" className="mt-2 w-full cursor-not-allowed rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Category</label>
                      <select name="category" required value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3">
                        <option value="" disabled>Select category</option>
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Resident Address</label>
                      <input name="address" type="text" required placeholder="ENTER RESIDENT ADDRESS" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Age</label>
                      <input name="age" type="number" min="0" required className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                    </div>
                  </div>
                </div>

                <div id="contact" ref={refs.contact} className="space-y-4">
                  <h2 className="text-lg font-semibold text-mssn-slate">Contact Information</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {rules.email.visible ? (
                      <div>
                        <label className="block text-sm font-semibold text-mssn-slate">Email Address</label>
                        <input name="email" type="email" required={rules.email.required} placeholder="ENTER EMAIL ADDRESS" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                      </div>
                    ) : (
                      <HiddenInput name="email" value="-------" />
                    )}

                    {rules.phone.visible ? (
                      <div>
                        <label className="block text-sm font-semibold text-mssn-slate">Phone Number</label>
                        <input name="phone" type="text" required={rules.phone.required} placeholder="ENTER PHONE NUMBER" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                      </div>
                    ) : (
                      <HiddenInput name="phone" value="-------" />
                    )}
                  </div>
                </div>

                <div id="emergency" ref={refs.emergency} className="space-y-4">
                  <h2 className="text-lg font-semibold text-mssn-slate">Emergency Contact</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {rules.nextOfKin.visible ? (
                      <div>
                        <label className="block text-sm font-semibold text-mssn-slate">Next of Kin</label>
                        <input name="nextOfKin" type="text" required={rules.nextOfKin.required} placeholder="ENTER NEXT OF KIN" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                      </div>
                    ) : (
                      <HiddenInput name="nextOfKin" value="------" />
                    )}

                    {rules.nextOfKinPhone.visible ? (
                      <div>
                        <label className="block text-sm font-semibold text-mssn-slate">Next of Kin Phone Number</label>
                        <input name="nextOfKinPhone" type="text" required={rules.nextOfKinPhone.required} placeholder="ENTER NEXT OF KIN PHONE NUMBER" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                      </div>
                    ) : (
                      <HiddenInput name="nextOfKinPhone" value="------" />
                    )}
                  </div>
                </div>

                <div id="details" ref={refs.details} className="space-y-4">
                  <h2 className="text-lg font-semibold text-mssn-slate">Personal Details</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {rules.maritalStatus.visible ? (
                      <div>
                        <label className="block text-sm font-semibold text-mssn-slate">Marital Status</label>
                        <select name="maritalStatus" required={rules.maritalStatus.required} className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3">
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
                      <label className="block text-sm font-semibold text-mssn-slate">State of Origin</label>
                      <select name="state" required className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3">
                        <option value="" disabled>Select state</option>
                        {states.map((s) => (
                          <option key={s.value ?? s} value={s.value ?? s}>{s.label ?? s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div id="education" ref={refs.education} className="space-y-4">
                  <h2 className="text-lg font-semibold text-mssn-slate">Educational Information</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-mssn-slate">School</label>
                      {rules.school.mode === 'text' ? (
                        <input name="school" type="text" required placeholder="ENTER SCHOOL NAME" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                      ) : (
                        <select name="school" required className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3">
                          <option value="" disabled>Select school</option>
                          {(category === 'Secondary' ? schoolsSec : schoolsUnd).map((s) => (
                            <option key={s.value ?? s} value={s.value ?? s}>{s.label ?? s}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Class Level</label>
                      <select name="classLevel" required className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3">
                        <option value="" disabled>Select class level</option>
                        {classLevels.map((c) => (
                          <option key={c.value ?? c} value={c.value ?? c}>{c.label ?? c}</option>
                        ))}
                      </select>
                    </div>

                    {rules.course.visible ? (
                      <div>
                        <label className="block text-sm font-semibold text-mssn-slate">Course</label>
                        <select name="course" required={rules.course.required} className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3">
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
                        <label className="block text-sm font-semibold text-mssn-slate">Highest Qualification</label>
                        <select name="highestQualification" required={rules.highestQualification.required} className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3">
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
                        <label className="block text-sm font-semibold text-mssn-slate">Discipline / Occupation</label>
                        <input name="discipline" type="text" required={rules.discipline.required} placeholder="ENTER DISCIPLINE / OCCUPATION" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                      </div>
                    ) : (
                      <HiddenInput name="discipline" value="------" />
                    )}

                    {rules.organisation.visible ? (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-mssn-slate">Organisation / Workplace</label>
                        <input name="organisation" type="text" placeholder="ENTER ORGANISATION / WORK PLACE" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                      </div>
                    ) : (
                      <HiddenInput name="organisation" value="------" />
                    )}
                  </div>
                </div>

                <div id="membership" ref={refs.membership} className="space-y-4">
                  <h2 className="text-lg font-semibold text-mssn-slate">MSSN Membership Details</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Ailments</label>
                      <select name="ailments" required className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3">
                        <option value="" disabled>Select ailment</option>
                        {ailments.map((a) => (
                          <option key={a.value ?? a} value={a.value ?? a}>{a.label ?? a}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Area Council</label>
                      <select name="council" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3">
                        <option value="">Select council (optional)</option>
                        {councils.map((c) => (
                          <option key={c.value ?? c} value={c.value ?? c}>{c.label ?? c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Branch</label>
                      <select name="branch" className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3">
                        <option value="">Select branch (optional)</option>
                        {branches.map((b) => (
                          <option key={b.value ?? b} value={b.value ?? b}>{b.label ?? b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-mssn-slate">Numbers of Camp Previously Attended</label>
                      <input name="previousCamps" type="text" readOnly placeholder="ENTER NUMBERS OF PREVIOUSLY ATTENDED" className="mt-2 w-full cursor-not-allowed rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-2px] sm:w-auto">
                    Register & Pay
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
