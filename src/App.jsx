import { useEffect, useState } from 'react'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ExistingMemberValidate from './pages/ExistingMemberValidate.jsx'
import ExistingMemberForm from './pages/ExistingMemberForm.jsx'
import RegistrationGate from './pages/RegistrationGate.jsx'

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/')
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

function matchPath(pattern, path) {
  const names = []
  const regex = new RegExp('^' + pattern
    .replace(/[#.]/g, (m) => `\\${m}`)
    .replace(/\//g, '\\/')
    .replace(/:([A-Za-z0-9_]+)/g, (_, name) => { names.push(name); return '([^/]+)'; }) + '$')
  const m = path.match(regex)
  if (!m) return null
  const params = {}
  names.forEach((n, i) => { params[n] = decodeURIComponent(m[i + 1]) })
  return params
}

function Router() {
  const hash = useHashRoute()
  const path = hash.split('?')[0]

  // Route table with simple dynamic segments
  const routes = [
    {
      pattern: '#/existing/:action',
      render: ({ params }) => (params.action === 'edit' ? <ExistingMemberForm /> : <ExistingMemberValidate />),
    },
    { pattern: '#/registration', render: () => <RegistrationGate /> },
    { pattern: '#/', render: () => <HomePage /> },
  ]

  for (const r of routes) {
    const params = matchPath(r.pattern, path)
    if (params) return r.render({ params })
  }
  return <HomePage />
}

function App() {
  return (
    <Layout>
      <Router />
    </Layout>
  )
}

export default App
