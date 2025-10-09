import { useState } from 'react'

export default function ExistingMemberValidate() {
  const [mssnId, setMssnId] = useState('')
  const [surname, setSurname] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      // Let native/Parsley validation messages show
      form.reportValidity()
      return
    }
    const params = new URLSearchParams({ mssnId: mssnId.trim(), surname: surname.trim() })
    window.location.hash = `#/existing/edit?${params.toString()}`
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-mssn-slate/10 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-mssn-slate">Existing Member Validation</h1>
        <p className="mt-2 text-sm text-mssn-slate/70">Enter your MSSN ID and Surname to continue.</p>
        <form id="validateForm" className="mt-6 grid gap-5" data-parsley-validate onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="mssnId" className="block text-sm font-semibold text-mssn-slate">MSSN ID</label>
            <input
              id="mssnId"
              name="mssnId"
              type="text"
              required
              placeholder="ENTER MSSN ID"
              value={mssnId}
              onChange={(e) => setMssnId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3 text-mssn-slate outline-none ring-mssn-green/30 focus:ring"
            />
          </div>
          <div>
            <label htmlFor="surname" className="block text-sm font-semibold text-mssn-slate">Surname</label>
            <input
              id="surname"
              name="surname"
              type="text"
              required
              placeholder="ENTER SURNAME"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3 text-mssn-slate outline-none ring-mssn-green/30 focus:ring"
            />
          </div>
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            Validate & Continue
          </button>
        </form>
      </div>
    </section>
  )
}
