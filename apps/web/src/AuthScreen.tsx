import { useEffect, useState, type FormEvent } from 'react'
import { useAppData } from './AppData'
import { supabase } from './supabase'

type Mode = 'sign-in' | 'register' | 'reset' | 'new-password'

// Signed-out layout: no menu, rendered at whatever URL was opened.
export function AuthScreen() {
  const { recovery, endRecovery, notice, setNotice } = useAppData()
  const [mode, setMode] = useState<Mode>(recovery ? 'new-password' : 'sign-in')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (recovery) setMode('new-password') }, [recovery])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    setBusy(true)
    setMessage('')
    setNotice('')
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
        await supabase.auth.signOut()
        endRecovery()
        setMode('sign-in')
        setMessage('Password updated. Sign in with your new password.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally { setBusy(false) }
  }

  const shownMessage = message || notice
  return <main className="page-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="Cycle Pro home"><span className="brand-mark">C</span><span>cycle<span className="brand-light">pro</span></span></a><span className="topbar-note">Private cycling account</span></header>
    <section className="account-page" aria-labelledby="page-title">
      <p className="eyebrow">CYCLING TRAINING</p>
      <h1 id="page-title">{mode === 'new-password' ? 'Choose a new password' : mode === 'register' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'}</h1>
      <p className="intro">{mode === 'new-password' ? 'Choose a new password for your account.' : 'Sign in to access your private cycling account.'}</p>
      {!supabase ? <p role="alert">Account access is not configured. Start the local Supabase services and reload.</p> : null}
      <form className="account-form" onSubmit={(event) => void submit(event)}>
        {mode !== 'new-password' ? <label>Email address<input type="email" name="email" autoComplete="email" required /></label> : null}
        {mode !== 'reset' ? <label>{mode === 'new-password' ? 'New password' : 'Password'}<input type="password" name="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength={8} required /></label> : null}
        <button disabled={busy || !supabase}>{busy ? 'Please wait…' : mode === 'register' ? 'Create account' : mode === 'reset' ? 'Send reset link' : mode === 'new-password' ? 'Update password' : 'Sign in'}</button>
        {mode === 'sign-in' ? <div className="account-links"><button type="button" className="text-button" onClick={() => { setMode('register'); setMessage('') }}>Create an account</button><button type="button" className="text-button" onClick={() => { setMode('reset'); setMessage('') }}>Forgot password?</button></div> : <button type="button" className="text-button" onClick={() => { setMode('sign-in'); setMessage('') }}>Back to sign in</button>}
      </form>
      {shownMessage ? <p className="form-message" role="status">{shownMessage}</p> : null}
    </section>
    <footer className="footer"><span>Made for the long ride.</span><span className="footer-mark">CYCLE PRO <span>·</span> ROAD CYCLING</span></footer>
  </main>
}
