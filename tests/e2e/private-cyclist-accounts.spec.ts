import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

function localSupabaseSettings() {
  const values = Object.fromEntries(readFileSync('apps/api/.dev.vars', 'utf8').trim().split('\n').map((line) => {
    const separator = line.indexOf('=')
    return [line.slice(0, separator), line.slice(separator + 1)]
  }))
  return { url: values.SUPABASE_URL, anonKey: values.SUPABASE_ANON_KEY, serviceKey: values.SUPABASE_SERVICE_ROLE_KEY }
}

async function createConfirmedUser(url: string, serviceKey: string, email: string, password: string) {
  const response = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
  if (!response.ok) throw new Error(`Could not create isolation-test Cyclist: ${await response.text()}`)
  return await response.json() as { id: string }
}

async function signIn(url: string, anonKey: string, email: string, password: string) {
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new Error(`Could not sign in isolation-test Cyclist: ${await response.text()}`)
  return await response.json() as { access_token: string }
}

async function waitForAuthEmail(email: string, type: 'signup' | 'recovery') {
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    const listResponse = await fetch('http://127.0.0.1:54324/api/v1/messages')
    if (listResponse.ok) {
      const list = await listResponse.json() as { messages?: Array<{ ID: string; To?: Array<{ Address: string }> }> }
      const message = list.messages?.find((item) => item.To?.some((recipient) => recipient.Address === email))
      if (message) {
        const response = await fetch(`http://127.0.0.1:54324/api/v1/message/${message.ID}`)
        const body = await response.json() as { HTML?: string; Text?: string }
        const link = `${body.HTML ?? ''}\n${body.Text ?? ''}`.match(/https?:[^\s"<>]+/g)?.find((url) => url.includes('/auth/v1/verify') && url.includes(`type=${type}`))
        if (link) return link.replaceAll('&amp;', '&')
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error('No confirmation email arrived in the local email inbox.')
}

test('Cyclist verifies an email, signs in, and can recover a password', async ({ page }) => {
  const email = `cyclist-${Date.now()}@example.test`
  const password = 'CyclePro-test-123'

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await page.getByRole('button', { name: 'Create an account' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('status')).toHaveText('Check your email to verify your account before signing in.')

  await page.goto(await waitForAuthEmail(email, 'signup'))
  await expect(page.getByRole('heading', { name: 'Your account' })).toBeVisible()
  await expect(page.getByText(email)).toBeVisible()
  await expect(page.getByText('Your private Cyclist account is ready.')).toBeVisible()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()

  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Your account' })).toBeVisible()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.getByRole('button', { name: 'Forgot password?' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(page.getByRole('status')).toHaveText('If an account uses that email, a password reset link has been sent.')
  await page.goto(await waitForAuthEmail(email, 'recovery'))
  await expect(page.getByRole('heading', { name: 'Choose a new password' })).toBeVisible()
  const newPassword = 'CyclePro-test-456'
  await page.getByRole('textbox', { name: 'New password' }).fill(newPassword)
  await page.getByRole('button', { name: 'Update password' }).click()
  await expect(page.getByRole('status')).toHaveText('Password updated. Sign in with your new password.')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(newPassword)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Your account' })).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Delete account' }).click()
  await expect(page.getByRole('status')).toHaveText('Your account and associated data have been deleted.')
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
})

test('Cyclist can create and edit one Primary active goal from a template', async ({ page }) => {
  const email = `goal-cyclist-${Date.now()}@example.test`
  await page.goto('/')
  await page.getByRole('button', { name: 'Create an account' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill('CyclePro-goal-123')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.goto(await waitForAuthEmail(email, 'signup'))
  await expect(page.getByRole('heading', { name: 'Your training goal' })).toBeVisible()
  await expect(page.getByText('You do not have a Primary active goal yet.')).toBeVisible()

  await page.getByRole('button', { name: 'Set a goal' }).click()
  await page.getByLabel('Start from a template').selectOption('event-century')
  await expect(page.getByLabel('Goal type')).toHaveValue('event')
  await page.getByLabel('Goal name').fill('Coast to Coast 100')
  await page.getByLabel('Event date').fill('2027-06-12')
  await page.getByRole('button', { name: 'Save primary goal' }).click()
  await expect(page.getByText('Coast to Coast 100')).toBeVisible()
  await expect(page.getByText('Complete the event')).toBeVisible()

  await page.getByRole('button', { name: 'Edit goal' }).click()
  await page.getByLabel('Goal type').selectOption('general-fitness')
  await page.getByLabel('Start from a template').selectOption('fitness-frequency')
  await page.getByRole('spinbutton', { name: 'Rides per week' }).fill('3')
  await page.getByLabel('FTP target (optional)').fill('250')
  await page.getByRole('button', { name: 'Save primary goal' }).click()
  await expect(page.getByText('3 rides per week')).toBeVisible()
  await expect(page.getByText('FTP target: 250 W')).toBeVisible()

  await page.reload()
  await expect(page.getByText('3 rides per week')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit goal' })).toHaveCount(1)
})

test('signed-out Cyclists are asked to sign in before accessing their account', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await expect(page.getByText('Your training account is private to you.')).toHaveCount(0)
})

test('Cyclists cannot read or modify another Cyclist account record', async () => {
  const { url, anonKey, serviceKey } = localSupabaseSettings()
  const password = 'CyclePro-isolation-123'
  const firstEmail = `private-one-${Date.now()}@example.test`
  const secondEmail = `private-two-${Date.now()}@example.test`
  const first = await createConfirmedUser(url, serviceKey, firstEmail, password)
  let second: { id: string } | undefined

  try {
    second = await createConfirmedUser(url, serviceKey, secondEmail, password)
    const [firstSession, secondSession] = await Promise.all([
      signIn(url, anonKey, firstEmail, password),
      signIn(url, anonKey, secondEmail, password),
    ])
    const firstRowsResponse = await fetch(`${url}/rest/v1/cyclists?select=id`, {
      headers: { apikey: anonKey, authorization: `Bearer ${firstSession.access_token}` },
    })
    const firstRows = await firstRowsResponse.json() as Array<{ id: string }>
    expect(firstRowsResponse.ok).toBe(true)
    expect(firstRows.map(({ id }) => id)).toEqual([first.id])

    const secondRowsResponse = await fetch(`${url}/rest/v1/cyclists?select=id`, {
      headers: { apikey: anonKey, authorization: `Bearer ${secondSession.access_token}` },
    })
    const secondRows = await secondRowsResponse.json() as Array<{ id: string }>
    expect(secondRowsResponse.ok).toBe(true)
    expect(secondRows.map(({ id }) => id)).toEqual([second.id])

    const goalCreateResponse = await fetch(`${url}/rest/v1/training_goals`, {
      method: 'POST',
      headers: { apikey: anonKey, authorization: `Bearer ${firstSession.access_token}`, 'content-type': 'application/json', prefer: 'return=representation' },
      body: JSON.stringify({
        cyclist_id: first.id,
        goal_type: 'event',
        name: 'Private event goal',
        event_date: '2027-06-12',
        event_outcome: 'complete',
      }),
    })
    expect(goalCreateResponse.ok).toBe(true)
    const [privateGoal] = await goalCreateResponse.json() as Array<{ id: string; name: string }>
    const secondGoalResponse = await fetch(`${url}/rest/v1/training_goals?select=id,name`, {
      headers: { apikey: anonKey, authorization: `Bearer ${secondSession.access_token}` },
    })
    expect(await secondGoalResponse.json()).toEqual([])

    const modification = await fetch(`${url}/rest/v1/cyclists?id=eq.${second.id}`, {
      method: 'PATCH',
      headers: { apikey: anonKey, authorization: `Bearer ${firstSession.access_token}`, 'content-type': 'application/json', prefer: 'return=representation' },
      body: JSON.stringify({ id: first.id }),
    })
    expect(modification.ok).toBe(false)

    await fetch(`${url}/rest/v1/training_goals?id=eq.${privateGoal.id}`, {
      method: 'PATCH',
      headers: { apikey: anonKey, authorization: `Bearer ${secondSession.access_token}`, 'content-type': 'application/json', prefer: 'return=minimal' },
      body: JSON.stringify({ name: 'Changed by another Cyclist' }),
    })
    const verifiedGoalResponse = await fetch(`${url}/rest/v1/training_goals?id=eq.${privateGoal.id}&select=name`, {
      headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
    })
    expect(await verifiedGoalResponse.json()).toEqual([{ name: 'Private event goal' }])
  } finally {
    for (const user of [first, second]) {
      if (user) await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
      })
    }
  }
})
