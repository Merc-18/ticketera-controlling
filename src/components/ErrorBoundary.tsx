import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) }
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-md w-full text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
          <p className="text-sm text-gray-500 mb-6">{this.state.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition"
          >
            Recargar la página
          </button>
        </div>
      </div>
    )
  }
}
