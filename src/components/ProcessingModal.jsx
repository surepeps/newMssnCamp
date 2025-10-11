import React from 'react'

export default function ProcessingModal({ title = 'Processing…', subtitle = 'Please wait while we submit your registration and prepare payment.', visible = false, onCancel }) {
  if (!visible) return null
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-mssn-night/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-mssn-slate/10 bg-white p-6 shadow-glow">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mssn-green/10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-mssn-green border-r-transparent" aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-mssn-slate">{title}</h3>
            <p className="mt-1 text-sm text-mssn-slate/70">{subtitle}</p>
          </div>
        </div>
        {onCancel ? (
          <div className="mt-6 text-right">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-xl border border-mssn-slate/20 px-4 py-2 text-sm font-semibold text-mssn-slate transition hover:border-mssn-green/40 hover:text-mssn-greenDark"
            >
              Cancel
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
