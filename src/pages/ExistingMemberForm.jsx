import { useEffect, useMemo, useRef, useState } from 'react'
import StepProgress from '../components/StepProgress.jsx'
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
import { RegistrationForm } from './NewMember.jsx'

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
          setShowUpgradeModal(Boolean(data?.upgraded))
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
            setShowUpgradeModal(Boolean(res.delegate?.upgraded))
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

  const schoolIdentifier = category === 'Secondary' ? 'S' : category === 'Undergraduate' ? 'U' : 'U'
  const classIdentifier = category === 'Secondary' ? 'S' : category === 'Undergraduate' ? 'U' : 'O'

  const toInfo = delegate?.upgrade_details?.[0]?.to || {}
  const targetPin = String(toInfo?.pin_category || '').toUpperCase()
  const targetCategory = targetPin === 'UNDERGRADUATE' ? 'undergraduate' : (targetPin === 'SECONDARY' || targetPin === 'TFL') ? 'secondary' : (targetPin ? 'others' : '')
  const currentCategoryLower = category === 'Undergraduate' ? 'undergraduate' : category === 'Secondary' ? 'secondary' : category === 'Others' ? 'others' : ''

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
            {upgradeStarted ? (
              <RegistrationForm category={targetCategory || currentCategoryLower} prefillValues={buildPrefill()} submitLabel="Register & Pay" enableDraft={false} />
            ) : (
              <>
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
                        <input name="surname" type="text" required placeholder="Enter surname" defaultValue={d.surname || surname} className={inputClass} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label className={labelClass}>Firstname *</label>
                        </div>
                        <input name="firstname" type="text" required placeholder="Enter firstname" defaultValue={d.firstname || ''} className={inputClass} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label className={labelClass}>Gender *</label>
                        </div>
                        <input name="gender" type="text" required readOnly placeholder="Gender" defaultValue={genderDisplay} className={`${inputClass} ${inputDisabledClass}`} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label className={labelClass}>Age *</label>
                        </div>
                        <input name="age" type="number" min="0" required placeholder="Enter age" defaultValue={d.date_of_birth || ''} className={inputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className={labelClass}>Othername</label>
                        </div>
                        <input name="othername" type="text" placeholder="Enter other names" defaultValue={d.othername || ''} className={inputClass} />
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
                        <textarea name="address" required rows={3} placeholder="Enter residential address" defaultValue={d.resident_address || ''} className={`${inputClass} resize-none`}></textarea>
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
                          <input name="email" type="email" required={rules.email.required} placeholder="name@email.com" defaultValue={d.email || ''} className={inputClass} />
                        </div>
                      ) : (
                        <HiddenInput name="email" value="-------" />
                      )}

                      {rules.phone.visible ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <label className={labelClass}>Phone Number{rules.phone.required ? ' *' : ''}</label>
                          </div>
                          <input name="phone" type="text" required={rules.phone.required} placeholder="Enter phone number" defaultValue={d.tel_no || ''} className={inputClass} />
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
                          <input name="nextOfKin" type="text" required={rules.nextOfKin.required} placeholder="Enter next of kin" defaultValue={d.next_of_kin || ''} className={inputClass} />
                        </div>
                      ) : (
                        <HiddenInput name="nextOfKin" value="------" />
                      )}

                      {rules.nextOfKinPhone.visible ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <label className={labelClass}>Next of Kin Phone Number{rules.nextOfKinPhone.required ? ' *' : ''}</label>
                          </div>
                          <input name="nextOfKinPhone" type="text" required={rules.nextOfKinPhone.required} placeholder="Enter phone number" defaultValue={d.next_of_kin_tel || ''} className={inputClass} />
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
                          <select name="maritalStatus" required={rules.maritalStatus.required} defaultValue={d.marital_status || ''} className={inputClass}>
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
                        <AsyncSelect
                          value={vState}
                          onChange={setVState}
                          placeholder="Select state..."
                          fetchPage={({ page, search }) => queryStates({ page, limit: 20, search })}
                        />
                        <HiddenInput name="state" value={vState} />
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
                          <input name="school" type="text" required placeholder="Enter school name" defaultValue={d.school || ''} className={inputClass} />
                        ) : (
                          <>
                            <AsyncSelect
                              value={vSchool}
                              onChange={setVSchool}
                              placeholder={category === 'Undergraduate' || category === 'Others' ? 'Select institution...' : 'Select school...'}
                              fetchPage={({ page, search }) => querySchools({ identifier: schoolIdentifier, page, limit: 20, search })}
                            />
                            <HiddenInput name="school" value={vSchool} />
                          </>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className={labelClass}>Class Level *</label>
                        </div>
                        <AsyncSelect
                          value={vClassLevel}
                          onChange={setVClassLevel}
                          placeholder="Select class level..."
                          fetchPage={({ page, search }) => queryClassLevels({ identifier: classIdentifier, page, limit: 20, search })}
                        />
                        <HiddenInput name="classLevel" value={vClassLevel} />
                      </div>

                      {rules.course.visible ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <label className={labelClass}>Course{rules.course.required ? ' *' : ''}</label>
                          </div>
                          <AsyncSelect
                            value={vCourse}
                            onChange={setVCourse}
                            placeholder="Select course..."
                            fetchPage={({ page, search }) => queryCourses({ page, limit: 20, search })}
                          />
                          <HiddenInput name="course" value={vCourse || '------'} />
                        </div>
                      ) : (
                        <HiddenInput name="course" value="------" />
                      )}

                      {rules.highestQualification.visible ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <label className={labelClass}>Highest Qualification{rules.highestQualification.required ? ' *' : ''}</label>
                          </div>
                          <select name="highestQualification" required={rules.highestQualification.required} defaultValue={d.highest_qualification || ''} className={inputClass}>
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
                          <input name="discipline" type="text" required={rules.discipline.required} placeholder="Enter discipline or occupation" defaultValue={d.discipline || ''} className={inputClass} />
                        </div>
                      ) : (
                        <HiddenInput name="discipline" value="------" />
                      )}

                      {rules.organisation.visible ? (
                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between">
                            <label className={labelClass}>Organisation / Workplace</label>
                          </div>
                          <input name="organisation" type="text" placeholder="Enter organisation / work place" defaultValue={d.workplace || ''} className={inputClass} />
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
                          <label className={labelClass}>Area Council</label>
                        </div>
                        <AsyncSelect
                          value={vCouncil}
                          onChange={setVCouncil}
                          placeholder="Select council..."
                          fetchPage={({ page, search }) => queryCouncils({ page, limit: 20, search })}
                        />
                        <HiddenInput name="council" value={vCouncil} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className={labelClass}>Branch</label>
                        </div>
                        <input name="branch" value={vBranch} onChange={(e) => setVBranch(e.target.value)} placeholder="Enter branch (optional)" className={inputClass} />
                      </div>

                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className={labelClass}>Ailments</label>
                        </div>
                        <AsyncSelect
                          value={vAilments}
                          onChange={setVAilments}
                          multiple
                          placeholder="Select ailments..."
                          fetchPage={({ page, search }) => queryAilments({ page, limit: 20, search })}
                        />
                        <HiddenInput name="ailments" value={vAilments.join(',')} />
                      </div>

                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className={labelClass}>Numbers of Camp Previously Attended</label>
                        </div>
                        <input name="previousCamps" type="text" readOnly placeholder="—" defaultValue={d.camp_attendance ?? ''} className={`${inputClass} ${inputDisabledClass}`} />
                      </div>
                    </SectionCard>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button type="submit" disabled={Boolean(delegate?.upgraded)} className={`inline-flex items-center justify-center rounded-2xl px-8 py-3 text-sm font-semibold transition ${delegate?.upgraded ? 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate/60' : 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white hover:from-mssn-greenDark hover:to-mssn-greenDark'}`}>
                      Register & Pay
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
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
