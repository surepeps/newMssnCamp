import React from 'react'
import { navigate } from '../utils/navigation.js'

export default function ContactUs() {
  return (
    <section className="mx-auto mt-28 w-full max-w-6xl px-6">
      <div className="rounded-3xl border border-mssn-slate/10 bg-white p-8">
        <h1 className="text-2xl font-semibold text-mssn-slate">Contact us</h1>
        <p className="mt-2 text-sm text-mssn-slate/70">Reach out to our team for support, partnerships, or media enquiries.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-mssn-slate/10 bg-mssn-mist p-4">
            <h3 className="text-sm font-semibold text-mssn-slate">General enquiries</h3>
            <p className="mt-2 text-sm text-mssn-slate/70">camp@mssnlagos.org</p>
            <p className="mt-1 text-sm text-mssn-slate/70">+234 813 000 1122</p>
          </div>
          <div className="rounded-2xl border border-mssn-slate/10 bg-white p-4">
            <h3 className="text-sm font-semibold text-mssn-slate">Visit support hub</h3>
            <p className="mt-2 text-sm text-mssn-slate/70">Our knowledge base contains answers to common questions about registration, payments, and slips.</p>
            <div className="mt-4">
              <button onClick={() => navigate('/')} className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white">Return home</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
