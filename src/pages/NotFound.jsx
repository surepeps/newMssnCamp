import React from 'react'
import { navigate } from '../utils/navigation.js'

export default function NotFound() {
  return (
    <section className="mx-auto mt-28 w-full max-w-4xl px-6">
      <div className="rounded-3xl border border-mssn-slate/10 bg-white p-8 text-center">
        <h1 className="text-4xl font-bold text-mssn-slate">404</h1>
        <p className="mt-2 text-lg font-semibold text-mssn-slate">Page not found</p>
        <p className="mt-4 text-sm text-mssn-slate/70">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={() => navigate('/')} className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white">Return home</button>
          <button onClick={() => window.history.back()} className="inline-flex items-center justify-center rounded-full border border-mssn-slate/10 px-4 py-2 text-sm font-semibold text-mssn-slate">Go back</button>
        </div>
      </div>
    </section>
  )
}
