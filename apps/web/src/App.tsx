import { useEffect, useState } from 'react'

type ApiStatus = 'checking' | 'online' | 'offline'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')

  async function checkApi() {
    setApiStatus('checking')

    try {
      const healthUrl = apiBaseUrl
        ? `${apiBaseUrl}/healthz`
        : '/api/healthz'
      const response = await fetch(healthUrl)
      if (!response.ok) throw new Error('API health check failed')
      const result: unknown = await response.json()

      if (
        typeof result !== 'object' ||
        result === null ||
        !('status' in result) ||
        result.status !== 'ok'
      ) {
        throw new Error('API returned an unexpected health response')
      }

      setApiStatus('online')
    } catch {
      setApiStatus('offline')
    }
  }

  useEffect(() => {
    void checkApi()
  }, [])

  const statusText = {
    checking: 'Checking API connection',
    online: 'API connection is online',
    offline: 'API connection is unavailable',
  }[apiStatus]

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Cycle Pro home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>cycle<span className="brand-light">pro</span></span>
        </a>
        <span className="topbar-note">A clearer view of your training</span>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">YOUR RIDING, IN CONTEXT</p>
          <h1 id="page-title">Train with the<br /><em>whole picture.</em></h1>
          <p className="intro">
            A calm, clear place to bring your rides together and understand
            where your training is taking you.
          </p>
          <div className="connection" aria-live="polite" aria-atomic="true">
            <span className={`status-dot status-${apiStatus}`} aria-hidden="true" />
            <span>{statusText}</span>
            {apiStatus === 'offline' && (
              <button className="retry-button" onClick={() => void checkApi()}>
                Retry
              </button>
            )}
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun" />
          <div className="ridge ridge-back" />
          <div className="ridge ridge-front" />
          <div className="road road-one" />
          <div className="road road-two" />
          <div className="ride-line" />
          <span className="art-label">ONE RIDE AT A TIME</span>
          <span className="art-index">01 / 04</span>
        </div>
      </section>

      <footer className="footer">
        <span>Made for the long ride.</span>
        <span className="footer-mark">CYCLE PRO <span>·</span> ROAD CYCLING</span>
      </footer>
    </main>
  )
}

export default App
