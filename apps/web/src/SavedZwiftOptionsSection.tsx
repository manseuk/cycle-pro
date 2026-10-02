import { useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ZwiftOption = {
  id: string
  option_type: 'event' | 'race' | 'route'
  name: string
  option_date: string
  option_time: string | null
  route: string
  url: string
  notes: string
  goal_id: string | null
}

type Props = {
  client: SupabaseClient | null
  cyclistId: string
  goalId: string | null
  options: ZwiftOption[]
  onChanged: () => void
}

const emptyDraft = { optionType: 'event', name: '', date: '', time: '', route: '', url: '', notes: '', linkGoal: false }

export function SavedZwiftOptionsSection({ client, cyclistId, goalId, options, onChanged }: Props) {
  const [draft, setDraft] = useState(emptyDraft)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (values: Partial<typeof emptyDraft>) => setDraft({ ...draft, ...values })

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!client) return
    if (!/^https?:\/\/\S+$/i.test(draft.url.trim())) { setMessage('Enter a Zwift link starting with http:// or https://.'); return }
    setBusy(true)
    const { error } = await client.from('saved_zwift_options').insert({
      cyclist_id: cyclistId,
      option_type: draft.optionType,
      name: draft.name.trim(),
      option_date: draft.date,
      option_time: draft.time || null,
      route: draft.route.trim(),
      url: draft.url.trim(),
      notes: draft.notes.trim(),
      goal_id: draft.linkGoal ? goalId : null,
    })
    if (error) setMessage('Your Zwift option could not be saved. Please try again.')
    else { setDraft(emptyDraft); setMessage('Zwift option saved.'); onChanged() }
    setBusy(false)
  }

  async function remove(id: string) {
    if (!client) return
    const { error } = await client.from('saved_zwift_options').delete().eq('id', id)
    if (error) setMessage('Your Zwift option could not be removed.')
    else { setMessage('Zwift option removed.'); onChanged() }
  }

  return <section className="goal-section" aria-labelledby="zwift-heading">
    <h2 id="zwift-heading">Saved Zwift options</h2>
    <p>Save Zwift events, races, or routes by hand. Cycle Pro never reads Zwift listings or asks for your Zwift login.</p>
    <form className="goal-form" onSubmit={(event) => void save(event)}>
      <label>Type<select value={draft.optionType} onChange={(event) => set({ optionType: event.currentTarget.value })}>
        <option value="event">Event</option>
        <option value="race">Race</option>
        <option value="route">Route</option>
      </select></label>
      <label>Zwift option name<input value={draft.name} onChange={(event) => set({ name: event.currentTarget.value })} required maxLength={120} /></label>
      <label>Zwift option date<input type="date" value={draft.date} onChange={(event) => set({ date: event.currentTarget.value })} required /></label>
      <label>Start time (optional)<input type="time" value={draft.time} onChange={(event) => set({ time: event.currentTarget.value })} /></label>
      <label>Zwift route<input value={draft.route} onChange={(event) => set({ route: event.currentTarget.value })} required maxLength={120} /></label>
      <label>Zwift link<input type="url" value={draft.url} onChange={(event) => set({ url: event.currentTarget.value })} required /></label>
      <label>Notes (optional)<textarea value={draft.notes} onChange={(event) => set({ notes: event.currentTarget.value })} maxLength={1000} /></label>
      {goalId ? <label><input type="checkbox" checked={draft.linkGoal} onChange={(event) => set({ linkGoal: event.currentTarget.checked })} /> Associate with my Primary active goal</label> : null}
      <button disabled={busy}>{busy ? 'Saving…' : 'Save Zwift option'}</button>
    </form>
    {message ? <p role="status">{message}</p> : null}
    {options.length ? <div className="ride-list">{options.map((option) => <article className="goal-card zwift-card" key={option.id}>
      <p className="goal-kind">SAVED ZWIFT {option.option_type.toUpperCase()} · {option.option_date}{option.option_time ? ` ${option.option_time.slice(0, 5)}` : ''}{option.goal_id && option.goal_id === goalId ? ' · Linked to Primary active goal' : ''}</p>
      <h3>{option.name}</h3>
      <p>Route: {option.route}</p>
      {option.notes ? <p>{option.notes}</p> : null}
      <a href={option.url} target="_blank" rel="noopener noreferrer">Open {option.name} in Zwift</a>
      <button className="text-button" onClick={() => void remove(option.id)}>Remove</button>
    </article>)}</div> : null}
  </section>
}
