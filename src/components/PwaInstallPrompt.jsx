import * as React from 'react'

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
  const OPT_OUT_KEY = 'pwa_install_optout'
  const INSTALLED_KEY = 'pwa_install_installed'
  const [deferredPrompt, setDeferredPrompt] = React.useState(null)
  const [visible, setVisible] = React.useState(false)
  const [installed, setInstalled] = React.useState(() => isStandalone())
  const [showIosHelp, setShowIosHelp] = React.useState(false)
  const [updateAvailable, setUpdateAvailable] = React.useState(false)
  const [swRegistration, setSwRegistration] = React.useState(null)

  React.useEffect(() => {
    const optedOut = (() => {
      try { return localStorage.getItem(OPT_OUT_KEY) === '1' } catch { return false }
    })()

    const handler = (e) => {
      // Always prevent default mini-infobar
      e.preventDefault()
      if (optedOut || isStandalone()) return
      setDeferredPrompt(e)
      setVisible(true)
    }
    const onInstalled = () => {
      try { localStorage.setItem(INSTALLED_KEY, '1') } catch {}
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
    if (!optedOut && isAppleDevice() && !isStandalone()) {
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
      swRegistration.waiting.postMessage('SKIP_WAITING')
      setVisible(false)
      return
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice && choice.outcome === 'accepted') {
          try { localStorage.setItem(INSTALLED_KEY, '1') } catch {}
          try { localStorage.setItem(OPT_OUT_KEY, '1') } catch {}
        }
        setVisible(false)
        setDeferredPrompt(null)
      } catch {
        setVisible(false)
        setDeferredPrompt(null)
      }
      return
    }

    if (isAppleDevice()) {
      setShowIosHelp(true)
      return
    }

    setVisible(false)
  }

  return (
    <div className="fixed bottom-8 right-6 z-[1200] w-[min(420px,calc(100%-32px))] rounded-2xl bg-white/95 backdrop-blur-sm shadow-md ring-1 ring-mssn-slate/8">
      <div className="flex items-center gap-3 p-3">
        <div className="flex-shrink-0 rounded-lg bg-gradient-to-tr from-mssn-green to-mssn-greenDark p-2">
          <img src="/assets/thumbnail_large.png" alt="App" className="h-10 w-10 object-contain" onError={(e)=>{e.currentTarget.src='https://camp.mssnlagos.net/assets/thumbnail_large.png'}} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-mssn-slate">Add to Home screen</div>
          <div className="mt-1 text-xs text-mssn-slate/70">Install the app for faster access, offline support, and a better experience.</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onInstallClick} className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-mssn-greenDark">
            {updateAvailable ? 'Update' : 'Install'}
          </button>
          <button onClick={() => { try { localStorage.setItem(OPT_OUT_KEY, '1') } catch {} setVisible(false) }} aria-label="Dismiss install prompt" className="text-sm text-mssn-slate/60 px-2">✕</button>
        </div>
      </div>

      {showIosHelp && (
        <div className="px-3 pb-3 text-xs text-mssn-slate/70">
          On iOS: open in Safari, tap Share, then “Add to Home Screen” to add the app.
        </div>
      )}
    </div>
  )
}
