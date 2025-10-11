import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // You can log error to an external service here
    this.setState({ error, info })
    // console.error(error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, info: null })
    window.location.reload()
  }

  handleHome = () => {
    this.setState({ hasError: false, error: null, info: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-mssn-mist p-6">
          <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-soft">
            <h1 className="text-2xl font-semibold text-mssn-slate">Something went wrong</h1>
            <p className="mt-2 text-sm text-mssn-slate/70">An unexpected error occurred. You can try reloading the page or return to the homepage.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={this.handleReload} className="inline-flex items-center justify-center rounded-full bg-mssn-green px-4 py-2 text-sm font-semibold text-white">Reload</button>
              <button onClick={this.handleHome} className="inline-flex items-center justify-center rounded-full border border-mssn-slate/10 px-4 py-2 text-sm font-semibold text-mssn-slate">Home</button>
            </div>
            <details className="mt-4 text-xs text-mssn-slate/60">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="mt-2 max-h-48 overflow-auto p-2 text-[0.72rem]">{String(this.state.error && this.state.error.toString())}
{this.state.info?.componentStack}</pre>
            </details>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
