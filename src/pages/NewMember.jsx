import { useEffect, useMemo, useState } from 'react'
import { fetchAilments, fetchCouncils, fetchBranches, fetchStates, fetchSchoolsSecondary, fetchClassLevels } from '../services/dataProvider.js'

const CATEGORIES = ['secondary', 'undergraduate', 'others']

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

function SecondaryForm() {
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

  const [councilOptions, setCouncilOptions] = useState([])
  const [branchOptions, setBranchOptions] = useState([])
  const [stateOptions, setStateOptions] = useState([])
  const [schoolOptions, setSchoolOptions] = useState([])
  const [classLevelOptions, setClassLevelOptions] = useState([])
  const [ailmentOptions, setAilmentOptions] = useState([])

  useEffect(() => {
    ;(async () => {
      const [councils, states, schools, classes, ailmentsRes] = await Promise.all([
        fetchCouncils({ page: 1, limit: 200 }),
        fetchStates(),
        fetchSchoolsSecondary(),
        fetchClassLevels('Secondary'),
        fetchAilments({ page: 1, limit: 100 }),
      ])
      setCouncilOptions(councils)
      setStateOptions(states)
      setSchoolOptions(schools)
      setClassLevelOptions(classes)
      setAilmentOptions(ailmentsRes)
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      setBranch('')
      if (!areaCouncil) {
        setBranchOptions([])
        return
      }
      const branches = await fetchBranches(areaCouncil)
      setBranchOptions(branches)
    })()
  }, [areaCouncil])

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
      school: school || undefined,
      class_level: classLevel || undefined,
      ailments: ailments.join(','),
      pin_category: 'secondary',
    }

    try {
      const prev = JSON.parse(localStorage.getItem('new_member_submissions') || '[]')
      localStorage.setItem('new_member_submissions', JSON.stringify([...prev, payload]))
    } catch {}

    window.location.hash = '#/registration'
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <form onSubmit={onSubmit} className="p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-mssn-green">New Member</span>
              <h1 className="text-2xl font-semibold capitalize text-mssn-slate">secondary</h1>
            </div>
            <a href="#/new" className="text-sm text-mssn-greenDark">Change</a>
          </div>

          <input type="hidden" name="pin_category" value="secondary" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <Label required>Surname</Label>
              <input name="surname" value={surname} onChange={(e)=>setSurname(e.target.value)} required className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <Label required>Firstname</Label>
              <input name="firstname" value={firstname} onChange={(e)=>setFirstname(e.target.value)} required className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <Label>Othername</Label>
              <input name="othername" value={othername} onChange={(e)=>setOthername(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <Label required>Sex</Label>
              <select name="sex" value={sex} onChange={(e)=>setSex(e.target.value)} required className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm">
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>

            <label className="block">
              <Label required>Date of Birth (Age)</Label>
              <input name="date_of_birth" type="number" min="1" value={age} onChange={(e)=>setAge(e.target.value)} required className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>

            <label className="block">
              <Label required>Area Council</Label>
              <select name="area_council" value={areaCouncil} onChange={(e)=>setAreaCouncil(e.target.value)} required className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm">
                <option value="">Select...</option>
                {councilOptions.map((c)=> (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <Label required>Branch</Label>
              <select name="branch" value={branch} onChange={(e)=>setBranch(e.target.value)} required disabled={!branchOptions.length} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-mssn-mist">
                <option value="">{branchOptions.length ? 'Select...' : 'Select area council first'}</option>
                {branchOptions.map((b)=> (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <Label>Email</Label>
              <input name="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <Label>Phone Number</Label>
              <input name="tel_no" value={tel} onChange={(e)=>setTel(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>

            <label className="block sm:col-span-2">
              <Label>Resident Address</Label>
              <input name="resident_address" value={address} onChange={(e)=>setAddress(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm" />
            </label>

            <label className="block">
              <Label>Marital Status</Label>
              <select name="marital_status" value={maritalStatus} onChange={(e)=>setMaritalStatus(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm">
                <option value="">Select...</option>
                <option value="Single">Single</option>
              </select>
            </label>

            <label className="block">
              <Label>State of Origin</Label>
              <select name="state_of_origin" value={stateOrigin} onChange={(e)=>setStateOrigin(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm">
                <option value="">Select...</option>
                {stateOptions.map((s)=> (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <Label>School</Label>
              <select name="school" value={school} onChange={(e)=>setSchool(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-mssn-mist" disabled={!schoolOptions.length}>
                <option value="">{schoolOptions.length ? 'Select...' : 'No schools available'}</option>
                {schoolOptions.map((s)=> (
                  <option key={s.value ?? s} value={s.value ?? s}>{s.label ?? s}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <Label>Class Level</Label>
              <select name="class_level" value={classLevel} onChange={(e)=>setClassLevel(e.target.value)} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm">
                <option value="">Select...</option>
                {classLevelOptions.map((c)=> (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <Label>Ailments</Label>
              <select name="ailments" multiple value={ailments} onChange={(e)=> setAilments(Array.from(e.target.selectedOptions).map(o=>String(o.value)))} className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm min-h-28">
                {ailmentOptions.map((a)=> (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-mssn-slate/60">Hold Ctrl/Cmd to select multiple.</div>
            </label>
          </div>

          <div className="mt-6 flex gap-3">
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

  if (category === 'secondary') {
    return <SecondaryForm />
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="rounded-3xl border border-mssn-slate/10 bg-mssn-mist/60 p-6 text-sm text-mssn-slate/70">
        The Undergraduate and Others forms are not configured yet.
      </div>
    </section>
  )
}
