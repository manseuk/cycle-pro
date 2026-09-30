import { useEffect, useState } from 'react'

type ApiStatus = 'checking' | 'online' | 'offline'
type SupabaseStatus = 'checking' | 'connected' | 'not-configured' | 'unavailable'

type HealthResponse = {
  status: 'ok'
  dependencies: { supabase: Exclude<SupabaseStatus, 'checking'> }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>('checking')

  async function checkApi() {
    setApiStatus('checking')
    setSupabaseStatus('checking')

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
        result.status !== 'ok' ||
        !('dependencies' in result) ||
        typeof result.dependencies !== 'object' ||
        result.dependencies === null ||
        !('supabase' in result.dependencies) ||
        !['connected', 'not-configured', 'unavailable'].includes(String(result.dependencies.supabase))
      ) {
        throw new Error('API returned an unexpected health response')
      }

      const health = result as HealthResponse
      setApiStatus('online')
      setSupabaseStatus(health.dependencies.supabase)
    } catch {
      setApiStatus('offline')
      setSupabaseStatus('unavailable')
    }
  }

  useEffect(() => {
    void checkApi()
  }, [])

  const apiStatusText = {
    checking: 'Checking',
    online: 'Online',
    offline: 'Unavailable',
  }[apiStatus]

  const supabaseStatusText = {
    checking: 'Checking',
    connected: 'Connected',
    'not-configured': 'Not configured',
    unavailable: 'Unavailable',
  }[supabaseStatus]

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Cycle Pro home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>cycle<span className="brand-light">pro</span></span>
        </a>
        <span className="topbar-note">Application status</span>
      </header>

      <section className="status-page" aria-labelledby="page-title">
        <div className="page-heading">
          <p className="eyebrow">CYCLING TRAINING</p>
          <h1 id="page-title">Cycle Pro</h1>
          <p className="intro">Application and local service health.</p>
        </div>

        <dl className="status-list" aria-live="polite" aria-atomic="true">
          <div className="status-row">
            <dt>Worker API</dt>
            <dd><span className={`status-dot status-${apiStatus}`} aria-hidden="true" />{apiStatusText}</dd>
          </div>
          <div className="status-row">
            <dt>Supabase</dt>
            <dd><span className={`status-dot status-${supabaseStatus}`} aria-hidden="true" />{supabaseStatusText}</dd>
          </div>
        </dl>

        {apiStatus === 'offline' || supabaseStatus === 'unavailable' ? (
          <button className="retry-button" onClick={() => void checkApi()}>
            Retry connection check
          </button>
        ) : null}
      </section>

      <footer className="footer">
        <span>Made for the long ride.</span>
        <span className="footer-mark">CYCLE PRO <span>·</span> ROAD CYCLING</span>
      </footer>
    </main>
  )
}

export default App
