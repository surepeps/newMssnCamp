import React, { useEffect, useState } from 'react'

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    const onInstalled = () => {
      setInstalled(true)
      setVisible(false)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!visible || installed) return null

  const onInstallClick = async () => {
    if (!deferredPrompt) return
    try {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      // Hide prompt regardless of choice
      setVisible(false)
      setDeferredPrompt(null)
    } catch {
      setVisible(false)
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-[1200] w-[min(880px,calc(100%-48px))] -translate-x-1/2 rounded-2xl border border-mssn-slate/10 bg-white px-4 py-3 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-mssn-green/10 grid place-items-center">
            <svg className="h-6 w-6 text-mssn-greenDark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-mssn-slate">Install app</div>
            <div className="mt-0.5 text-xs text-mssn-slate/70">Install this web app on your device for quick access.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onInstallClick} className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-mssn-greenDark">Install</button>
          <button onClick={() => setVisible(false)} className="inline-flex items-center justify-center rounded-full border border-mssn-slate/10 px-3 py-2 text-sm font-semibold text-mssn-slate">Dismiss</button>
        </div>
      </div>
    </div>
  )
}
