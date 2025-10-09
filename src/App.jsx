import { useEffect, useState } from 'react'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ExistingMemberValidate from './pages/ExistingMemberValidate.jsx'
import ExistingMemberForm from './pages/ExistingMemberForm.jsx'

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/')
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

function Router() {
  const hash = useHashRoute()
  const path = hash.split('?')[0]

  switch (path) {
    case '#/existing/validate':
      return <ExistingMemberValidate />
    case '#/existing/edit':
      return <ExistingMemberForm />
    case '#/':
    default:
      return <HomePage />
  }
}

function App() {
  return (
    <Layout>
      <Router />
    </Layout>
  )
}

export default App
