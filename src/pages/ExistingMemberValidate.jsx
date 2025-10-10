import { useState } from 'react'
import { useState } from 'react'
import { navigate } from '../utils/navigation.js'
import StepProgress from '../components/StepProgress.jsx'

export default function ExistingMemberValidate() {
  const [mssnId, setMssnId] = useState('')
  const [surname, setSurname] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    const params = new URLSearchParams({ mssnId: mssnId.trim(), surname: surname.trim() })
    navigate(`/existing/edit?${params.toString()}`)
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-6">
        <StepProgress steps={["Validate", "Edit", "Pay"]} current={0} />
      </div>
      <div className="overflow-hidden rounded-3xl border border-mssn-slate/10 bg-white">
        <div className="h-1 w-full bg-gradient-to-r from-mssn-green to-mssn-greenDark" />
        <div className="p-6 sm:p-8">
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
                className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3 text-mssn-slate outline-none ring-2 ring-transparent focus:ring-mssn-green/30"
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
                className="mt-2 w-full rounded-2xl border border-mssn-slate/20 bg-mssn-mist px-4 py-3 text-mssn-slate outline-none ring-2 ring-transparent focus:ring-mssn-green/30"
              />
            </div>
            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-mssn-green to-mssn-greenDark px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-2px] sm:w-auto"
            >
              Validate & Continue
            </button>
          </form>
          <div className="mt-6 rounded-2xl border border-mssn-slate/10 bg-mssn-mist/60 p-4 text-sm text-mssn-slate/80">
            We’ll verify your details and take you to the edit page to confirm or update your information before payment.
          </div>
        </div>
      </div>
    </section>
  )
}
