import { Component } from 'react'
import { ArrowCounterClockwise, Warning } from '@phosphor-icons/react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
              <Warning size={28} weight="fill" className="text-red-400" />
            </div>
            <h2 className="text-lg font-black text-[var(--color-ink)] mb-2">Something went wrong</h2>
            <p className="text-sm text-[var(--color-ink-muted)] mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-ink)] text-white text-sm font-semibold hover:bg-[#2A2520] transition-colors"
            >
              <ArrowCounterClockwise size={15} /> Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
