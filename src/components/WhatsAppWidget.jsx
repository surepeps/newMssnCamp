import React from 'react'

export default function WhatsAppWidget({ phone = '+2348130001122', message = 'Hello, I need support with the camp registration.' }) {
  const encoded = encodeURIComponent(message)
  const sanitized = phone.replace(/[^0-9+]/g, '')
  const href = `https://wa.me/${sanitized.replace('+', '')}?text=${encoded}`

  return (
    <div className="fixed bottom-6 right-6 z-[1200]">
      <a href={href} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-full bg-white/95 px-3 py-2 shadow-lg ring-1 ring-mssn-slate/10 hover:shadow-soft">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M20.52 3.48A11.953 11.953 0 0012 1C6.477 1 1.73 4.924 1.1 10.06c-.19 1.35.02 2.8.6 4.12L1 23l8.96-2.38c1.28.35 2.64.53 4 .53 5.523 0 10.27-3.924 10.9-9.06.18-1.35-.04-2.8-.64-4.12zM12 19.5c-1.21 0-2.4-.18-3.54-.53l-.25-.08L4 21l1.1-3.06-.1-.28A8.964 8.964 0 013 10.06C3.66 6.02 7.48 3 12 3c2.57 0 5.03 1.02 6.87 2.87C20.97 7.77 22 10.32 22 12.94c0 4.95-4.03 8.56-10 8.56z"/></svg>
        </span>
        <div className="hidden flex-col text-left sm:flex">
          <span className="text-sm font-semibold text-mssn-slate">Chat with support</span>
          <span className="text-xs text-mssn-slate/60">WhatsApp</span>
        </div>
      </a>
    </div>
  )
}
