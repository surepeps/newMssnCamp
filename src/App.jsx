import { useEffect, useState } from 'react'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ExistingMemberValidate from './pages/ExistingMemberValidate.jsx'
import ExistingMemberForm from './pages/ExistingMemberForm.jsx'
import RegistrationGate from './pages/RegistrationGate.jsx'
import RegistrationBoundary from './components/RegistrationBoundary.jsx'
import NewMember from './pages/NewMember.jsx'
import { Toaster } from 'sonner'

function usePathRoute() {
  const getLocation = () => `${window.location.pathname}${window.location.search}` || '/'
  const [location, setLocation] = useState(getLocation())

  useEffect(() => {
    const handlePopState = () => {
      setLocation(getLocation())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return location
}

function matchPath(pattern, path) {
  const names = []
  const regexParts = pattern.split('/').map((segment) => {
    if (segment.startsWith(':')) {
      names.push(segment.slice(1))
      return '([^/]+)'
    }
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  })
  const regex = new RegExp(`^${regexParts.join('/')}$`)
  const match = path.match(regex)
  if (!match) return null
  const params = {}
  names.forEach((name, index) => {
    params[name] = decodeURIComponent(match[index + 1])
  })
  return params
}

function Router() {
  const location = usePathRoute()
  const path = (location.split('?')[0] || '/') || '/'

  const routes = [
    { pattern: '/new/:category', render: ({ params }) => <NewMember category={params.category} /> },
    { pattern: '/new', render: () => <NewMember /> },
    {
      pattern: '/existing/:action',
      render: ({ params }) => (params.action === 'edit' ? <ExistingMemberForm /> : <ExistingMemberValidate />),
    },
    { pattern: '/registration/:section', render: () => <RegistrationGate /> },
    { pattern: '/registration', render: () => <RegistrationGate /> },
    { pattern: '/', render: () => <HomePage /> },
  ]

  for (const route of routes) {
    const params = matchPath(route.pattern, path)
    if (params) {
      return route.render({ params })
    }
  }
  return <HomePage />
}

function App() {
  return (
    <Layout>
      <RegistrationBoundary />
      <Router />
      <Toaster richColors position="top-center" closeButton />
    </Layout>
  )
}

export default App
