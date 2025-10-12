import React from 'react'

function isAppleDevice() {
  const ua = navigator.userAgent || navigator.vendor || ''
  const isiOS = /iphone|ipad|ipod/i.test(ua)
  const isMacTouch = /mac/i.test(ua) && (navigator.maxTouchPoints || 0) > 1
  return isiOS || isMacTouch
}
function isStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator.standalone === true)
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null)
  const [visible, setVisible] = React.useState(false)
  const [installed, setInstalled] = React.useState(false)
  const [showIosHelp, setShowIosHelp] = React.useState(false)
  const [updateAvailable, setUpdateAvailable] = React.useState(false)
  const [swRegistration, setSwRegistration] = React.useState(null)

  React.useEffect(() => {
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

    // Show Apple install hint when not already installed (iOS/iPadOS/macOS Safari)
    if (isAppleDevice() && !isStandalone()) {
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

    if (isAppleDevice()) {
      // show iOS/macOS Safari install hint (manual)
      setShowIosHelp(true)
      return
    }

    setVisible(false)
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-[1200] w-[min(880px,calc(100%-48px))] -translate-x-1/2 rounded-2xl border border-mssn-slate/10 bg-white px-4 py-3 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl ring-1 ring-mssn-green/20">
            <img src="https://camp.mssnlagos.net/assets/thumbnail_large.png" alt="MSSN Lagos" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-sm font-semibold text-mssn-slate">Install MSSN Camp Portal</div>
            <div className="mt-0.5 text-xs text-mssn-slate/70">Install the MSSN Lagos Camp Portal for faster access, offline support, and full‑screen use.</div>
            {updateAvailable ? (
              <div className="mt-1 text-xs text-amber-600">A new version is available — install to update now.</div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onInstallClick} className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-mssn-greenDark">
            {updateAvailable ? 'Update MSSN Portal' : 'Install MSSN Portal'}
          </button>
          <button onClick={() => setVisible(false)} className="inline-flex items-center justify-center rounded-full border border-mssn-slate/10 px-3 py-2 text-sm font-semibold text-mssn-slate">Not now</button>
        </div>
      </div>

      {showIosHelp && (
        <div className="mt-3 text-xs text-mssn-slate/70">
          On iOS: open in Safari, tap Share, then “Add to Home Screen” to add the MSSN Camp Portal.
        </div>
      )}
    </div>
  )
}
