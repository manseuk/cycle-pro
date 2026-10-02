import { useState } from 'react'
import { useAppData } from '../AppData'
import { PageHeading } from '../PageHeading'
import { apiBaseUrl, supabase } from '../supabase'

export default function Account() {
  const { session, cyclistAccount, setNotice } = useAppData()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

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
      setNotice('Your account and associated data have been deleted.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Account deletion failed.')
    } finally { setBusy(false) }
  }

  if (!session) return null
  return <section className="account-page" aria-labelledby="page-title">
    <p className="eyebrow">CYCLING TRAINING</p>
    <PageHeading>Your account</PageHeading>
    <p className="intro">Your training account is private to you.</p>
    <div className="account-card">
      <p>Signed in as <strong>{session.user.email}</strong></p>
      <p>{cyclistAccount === 'available' ? 'Your private Cyclist account is ready.' : cyclistAccount === 'loading' ? 'Loading your private account…' : 'Your private account could not be loaded. Refresh the page or contact support.'}</p>
      <button disabled={busy} onClick={() => void supabase?.auth.signOut()}>Sign out</button>
      <button className="danger-button" disabled={busy} onClick={() => void deleteAccount()}>Delete account</button>
    </div>
    {message ? <p className="form-message" role="status">{message}</p> : null}
  </section>
}
