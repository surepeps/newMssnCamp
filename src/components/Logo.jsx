import React from 'react'

export default function Logo({ size = 56, compact = false, className = '' }) {
  const s = Number(size) || 56
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div style={{ width: s, height: s }} className="relative flex-shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-mssn-green/10">
        <svg viewBox="0 0 64 64" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MSSN Lagos logo">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#2ecc71" />
              <stop offset="100%" stopColor="#27ae60" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill="url(#g1)" rx="12" />
          <g transform="translate(8,8) scale(0.75)" fill="#fff">
            <path d="M24 4c-6 0-11 5-11 11 0 7 11 21 11 21s11-14 11-21c0-6-5-11-11-11zm0 15a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
          </g>
        </svg>
        <div className="absolute -bottom-2 -right-2 h-5 w-5 rounded-full bg-mssn-green/80 ring-2 ring-white/70" />
      </div>
      {!compact && (
        <div className="flex flex-col text-left leading-tight">
          <span className="text-xs uppercase tracking-[0.18em] text-mssn-greenDark">MSSN Lagos</span>
          <span className="text-base font-semibold text-mssn-slate">Camp Experience</span>
          <span className="text-xs text-mssn-slate/60">Portal</span>
        </div>
      )}
    </div>
  )
}
