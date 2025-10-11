import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
)

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((reg) => {
      // Listen for updates and expose event
      if (reg.waiting) {
        window.dispatchEvent(new CustomEvent('swUpdated', { detail: { registration: reg } }))
      }
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing
        if (installing) {
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                window.dispatchEvent(new CustomEvent('swUpdated', { detail: { registration: reg } }))
              }
            }
          })
        }
      })

      // Handle controllingchanging to reload if new SW takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }).catch((err) => {
      // console.warn('Service worker registration failed:', err)
    })
  })
}
