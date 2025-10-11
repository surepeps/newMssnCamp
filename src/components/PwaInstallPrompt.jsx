import React, { useEffect, useState } from 'react'

function isiOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [swRegistration, setSwRegistration] = useState(null)

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

    const onSwUpdated = (e) => {
      setUpdateAvailable(true)
      setSwRegistration(e.detail?.registration || null)
      setVisible(true)
    }
    window.addEventListener('swUpdated', onSwUpdated)

    // Show iOS hint if no beforeinstallprompt and is iOS
    if (isiOS() && !window.matchMedia) {
      setShowIosHelp(true)
      setVisible(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('swUpdated', onSwUpdated)
    }
  }, [])

  if (!visible || installed) return null

  const onInstallClick = async () => {
    if (updateAvailable && swRegistration?.waiting) {
      // Tell SW to skip waiting
      swRegistration.waiting.postMessage('SKIP_WAITING')
      setVisible(false)
      return
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        await deferredPrompt.userChoice
        setVisible(false)
        setDeferredPrompt(null)
      } catch {
        setVisible(false)
        setDeferredPrompt(null)
      }
      return
    }

    if (isiOS()) {
      // show iOS install hint (manual)
      setShowIosHelp(true)
      return
    }

    setVisible(false)
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
            {updateAvailable ? (
              <div className="mt-1 text-xs text-amber-600">An update is available — install to refresh to the latest version.</div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onInstallClick} className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-mssn-greenDark">
            {updateAvailable ? 'Install update' : 'Install'}
          </button>
          <button onClick={() => setVisible(false)} className="inline-flex items-center justify-center rounded-full border border-mssn-slate/10 px-3 py-2 text-sm font-semibold text-mssn-slate">Dismiss</button>
        </div>
      </div>

      {showIosHelp && (
        <div className="mt-3 text-xs text-mssn-slate/70">
          For iOS devices: tap the Share button in Safari and choose "Add to Home Screen".
        </div>
      )}
    </div>
  )
}
