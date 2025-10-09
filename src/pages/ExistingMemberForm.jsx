import { useEffect, useMemo, useState } from 'react'
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
  return useMemo(() => new URLSearchParams(window.location.hash.split('?')[1] || ''), [])
}

function HiddenInput({ name, value }) {
  return <input type="hidden" name={name} value={value} />
}

export default function ExistingMemberForm() {
  const query = useQuery()
  const [category, setCategory] = useState('')
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

  const mssnId = query.get('mssnId') || ''
  const surname = query.get('surname') || ''

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

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="rounded-3xl border border-mssn-slate/10 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-mssn-slate">Existing Member Registration</h1>
        <p className="mt-2 text-sm text-mssn-slate/70">Review and edit your details. MSSN ID: <span className="font-semibold">{mssnId}</span>, Surname: <span className="font-semibold">{surname}</span></p>

        <form id="updForm" className="mt-6 grid gap-8" data-parsley-validate onSubmit={onSubmit} noValidate>
          <div className="space-y-4">
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

          <div className="space-y-4">
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

          <div className="space-y-4">
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

          <div className="space-y-4">
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

          <div className="space-y-4">
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

          <div className="space-y-4">
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
            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5">
              Register & Pay
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
