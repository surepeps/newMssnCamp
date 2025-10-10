import { useMemo, useState } from 'react'

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

function Field({ label, type = 'text', name, value, onChange, required, placeholder, options }) {
  if (type === 'select') {
    return (
      <label className="block">
        <span className="text-xs text-mssn-slate/60">{label}{required ? ' *' : ''}</span>
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm text-mssn-slate focus:outline-none focus:ring-2 focus:ring-mssn-green/40"
        >
          <option value="">Select...</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
    )
  }
  return (
    <label className="block">
      <span className="text-xs text-mssn-slate/60">{label}{required ? ' *' : ''}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-mssn-slate/20 bg-white px-3 py-2 text-sm text-mssn-slate placeholder:text-mssn-slate/40 focus:outline-none focus:ring-2 focus:ring-mssn-green/40"
      />
    </label>
  )
}

function useCategoryConfig(category) {
  return useMemo(() => {
    const base = [
      { name: 'full_name', label: 'Full Name', required: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ]},
      { name: 'phone', label: 'Phone Number', required: true, placeholder: '08012345678' },
      { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'you@example.com' },
    ]

    if (category === 'secondary') {
      return [
        ...base,
        { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
        { name: 'school_name', label: 'School Name', required: true },
        { name: 'level', label: 'Level', type: 'select', required: true, options: [
          { value: 'jss1', label: 'JSS 1' }, { value: 'jss2', label: 'JSS 2' }, { value: 'jss3', label: 'JSS 3' },
          { value: 'ss1', label: 'SS 1' }, { value: 'ss2', label: 'SS 2' }, { value: 'ss3', label: 'SS 3' },
        ] },
        { name: 'guardian_name', label: 'Parent/Guardian Name', required: true },
        { name: 'guardian_phone', label: 'Parent/Guardian Phone', required: true },
      ]
    }

    if (category === 'undergraduate') {
      return [
        ...base,
        { name: 'institution', label: 'Institution', required: true },
        { name: 'department', label: 'Department', required: true },
        { name: 'level', label: 'Level', type: 'select', required: true, options: [
          { value: '100', label: '100' }, { value: '200', label: '200' }, { value: '300', label: '300' }, { value: '400', label: '400' }, { value: '500', label: '500' },
        ] },
        { name: 'matric_no', label: 'Matric No.', required: true },
      ]
    }

    return [
      ...base,
      { name: 'occupation', label: 'Occupation', required: true },
      { name: 'organization', label: 'Organization', required: false },
    ]
  }, [category])
}

function CategoryForm({ category }) {
  const fields = useCategoryConfig(category)
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(f => [f.name, ''])))
  const [submitted, setSubmitted] = useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  const isValid = fields.every(f => !f.required || String(values[f.name] || '').trim().length > 0)
  const onSubmit = (e) => {
    e.preventDefault()
    if (!isValid) return
    const payload = { category, ...values, created_at: new Date().toISOString() }
    try {
      const prev = JSON.parse(localStorage.getItem('new_member_submissions') || '[]')
      localStorage.setItem('new_member_submissions', JSON.stringify([...prev, payload]))
    } catch {}
    setSubmitted(true)
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
              <h1 className="text-2xl font-semibold capitalize text-mssn-slate">{category}</h1>
            </div>
            <a href="#/new" className="text-sm text-mssn-greenDark">Change</a>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.type === 'email' || f.name === 'school_name' || f.name === 'institution' || f.name === 'department' || f.name === 'occupation' || f.name === 'organization' ? 'sm:col-span-2' : ''}>
                <Field {...f} value={values[f.name]} onChange={onChange} />
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={!isValid}
              className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${isValid ? 'bg-gradient-to-r from-mssn-green to-mssn-greenDark text-white' : 'cursor-not-allowed border border-mssn-slate/20 bg-mssn-mist text-mssn-slate'}`}
            >
              Continue to Registration
            </button>
            <a href="#/" className="inline-flex items-center justify-center rounded-full border border-mssn-slate/20 px-6 py-3 text-sm font-semibold text-mssn-slate">Cancel</a>
          </div>
          {submitted && (
            <p className="mt-3 text-xs text-mssn-slate/60">Your details have been saved for this session.</p>
          )}
        </form>
      </div>
    </section>
  )
}

export default function NewMember({ category }) {
  if (!category || !CATEGORIES.includes(category)) {
    return (
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="rounded-4xl bg-white p-6 shadow-soft ring-1 ring-mssn-slate/10">
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

  return <CategoryForm category={category} />
}
