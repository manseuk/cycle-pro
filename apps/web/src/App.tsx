import { useEffect, useState, type FormEvent } from 'react'
import { createClient, type Session } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, { auth: { skipAutoInitialize: true } }) : null
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<'sign-in' | 'register' | 'reset' | 'new-password'>('sign-in')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [cyclistAccount, setCyclistAccount] = useState<'loading' | 'available' | 'unavailable'>('loading')

  useEffect(() => {
    if (!supabase) { setReady(true); return }
    if (window.location.hash.includes('type=recovery') || new URLSearchParams(window.location.search).get('type') === 'recovery') {
      setMode('new-password')
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      if (event === 'PASSWORD_RECOVERY') setMode('new-password')
    })
    void supabase.auth.initialize().then(() => supabase.auth.getSession()).then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session || !supabase) return
    void supabase.from('cyclists').select('id').maybeSingle().then(({ data, error }) => {
      setCyclistAccount(!error && data ? 'available' : 'unavailable')
    })
  }, [session?.user.id])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    setBusy(true)
    setMessage('')
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } })
        if (error) throw error
        setMessage('Check your email to verify your account before signing in.')
      } else if (mode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin })
        if (error) throw error
        setMessage('If an account uses that email, a password reset link has been sent.')
      } else {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setMode('sign-in')
        setMessage('Password updated. Sign in with your new password.')
        await supabase.auth.signOut()
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally { setBusy(false) }
  }

  async function deleteAccount() {
    if (!supabase || !session) return
    if (!window.confirm('Permanently delete your account and all associated training data? This cannot be undone.')) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`${apiBaseUrl || '/api'}/auth/delete-account`, {
        method: 'POST',
        headers: { authorization: `Bearer ${session.access_token}` },
      })
      if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'Account deletion failed.')
      await supabase.auth.signOut()
      setMessage('Your account and associated data have been deleted.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Account deletion failed.')
    } finally { setBusy(false) }
  }

  if (!ready) return <main className="page-shell"><p role="status">Loading your account…</p></main>

  return <main className="page-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="Cycle Pro home"><span className="brand-mark">C</span><span>cycle<span className="brand-light">pro</span></span></a><span className="topbar-note">Private cycling account</span></header>
    <section className="account-page" aria-labelledby="page-title">
      <p className="eyebrow">CYCLING TRAINING</p>
      <h1 id="page-title">{mode === 'new-password' ? 'Choose a new password' : session ? 'Your account' : mode === 'register' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'}</h1>
      <p className="intro">{mode === 'new-password' ? 'Choose a new password for your account.' : session ? 'Your training account is private to you.' : 'Sign in to access your private cycling account.'}</p>
      {!supabase ? <p role="alert">Account access is not configured. Start the local Supabase services and reload.</p> : null}
      {session && mode !== 'new-password' ? <div className="account-card">
        <p>Signed in as <strong>{session.user.email}</strong></p>
        <p>{cyclistAccount === 'available' ? 'Your private Cyclist account is ready.' : cyclistAccount === 'loading' ? 'Loading your private account…' : 'Your private account could not be loaded. Refresh the page or contact support.'}</p>
        <button disabled={busy} onClick={() => void supabase?.auth.signOut()}>Sign out</button>
        <button className="danger-button" disabled={busy} onClick={() => void deleteAccount()}>Delete account</button>
      </div> : <form className="account-form" onSubmit={(event) => void submit(event)}>
        {mode !== 'new-password' ? <label>Email address<input type="email" name="email" autoComplete="email" required /></label> : null}
        {mode !== 'reset' ? <label>{mode === 'new-password' ? 'New password' : 'Password'}<input type="password" name="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength={8} required /></label> : null}
        <button disabled={busy || !supabase}>{busy ? 'Please wait…' : mode === 'register' ? 'Create account' : mode === 'reset' ? 'Send reset link' : mode === 'new-password' ? 'Update password' : 'Sign in'}</button>
        {mode === 'sign-in' ? <div className="account-links"><button type="button" className="text-button" onClick={() => { setMode('register'); setMessage('') }}>Create an account</button><button type="button" className="text-button" onClick={() => { setMode('reset'); setMessage('') }}>Forgot password?</button></div> : <button type="button" className="text-button" onClick={() => { setMode('sign-in'); setMessage('') }}>Back to sign in</button>}
      </form>}
      {message ? <p className="form-message" role="status">{message}</p> : null}
    </section>
    <footer className="footer"><span>Made for the long ride.</span><span className="footer-mark">CYCLE PRO <span>·</span> ROAD CYCLING</span></footer>
  </main>
}

export default App
