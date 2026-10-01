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

test('Cyclist imports independent FIT files, sees duplicate outcomes, edits notes, and deletes a Ride', async ({ page }) => {
  const email = `ride-cyclist-${Date.now()}@example.test`
  await page.goto('/')
  await page.getByRole('button', { name: 'Create an account' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill('CyclePro-ride-123')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.goto(await waitForAuthEmail(email, 'signup'))
  await expect(page.getByRole('heading', { name: 'Your rides' })).toBeVisible()

  await page.getByLabel('Calendar time zone').fill('Europe/London')
  await page.getByRole('button', { name: 'Save time zone' }).click()
  await expect(page.getByText('Calendar time zone saved.')).toBeVisible()

  const input = page.getByLabel('FIT files')
  await input.setInputFiles([
    { name: 'road-ride.fit', mimeType: 'application/octet-stream', buffer: readFileSync('tests/fixtures/road-ride.fit') },
    { name: 'partial-ride.fit', mimeType: 'application/octet-stream', buffer: readFileSync('tests/fixtures/partial-ride.fit') },
    { name: 'not-a-ride.fit', mimeType: 'application/octet-stream', buffer: Buffer.from('not a FIT file') },
  ])
  await page.getByRole('button', { name: 'Import 3 FIT files' }).click()
  await expect(page.getByText(/road-ride\.fit — Ride imported successfully\./)).toBeVisible()
  await expect(page.getByText(/partial-ride\.fit — Ride imported successfully\./)).toBeVisible()
  await expect(page.getByText(/not-a-ride\.fit — This file is not a valid FIT activity/)).toBeVisible()
  await expect(page.getByText('Unavailable', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('32.0 km')).toBeVisible()
  await expect(page.getByText('58 min')).toBeVisible()

  await input.setInputFiles('tests/fixtures/road-ride.fit')
  await page.getByRole('button', { name: 'Import 1 FIT file' }).click()
  await expect(page.getByText(/Exact duplicate skipped/)).toBeVisible()
  await input.setInputFiles('tests/fixtures/near-duplicate-ride.fit')
  await page.getByRole('button', { name: 'Import 1 FIT file' }).click()
  await expect(page.getByText(/Imported as a separate Ride\. It may duplicate/)).toBeVisible()

  const roadCard = page.locator('.goal-card').filter({ has: page.getByRole('heading', { name: 'road-ride' }) })
  await roadCard.getByRole('button', { name: 'Edit notes' }).click()
  await roadCard.getByLabel('Ride notes').fill('Windy on the exposed section.')
  await roadCard.getByRole('button', { name: 'Save notes' }).click()
  await expect(roadCard.getByText('Windy on the exposed section.')).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await roadCard.getByRole('button', { name: 'Delete ride' }).click()
  await expect(page.getByRole('heading', { name: 'road-ride' })).toHaveCount(0)
})

test('Cyclist sees completed Rides on the calendar by local date and can open and remove them', async ({ page }) => {
  const email = `calendar-cyclist-${Date.now()}@example.test`
  await page.goto('/')
  await page.getByRole('button', { name: 'Create an account' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill('CyclePro-calendar-123')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.goto(await waitForAuthEmail(email, 'signup'))
  await expect(page.getByRole('heading', { name: 'Training calendar' })).toBeVisible()

  await page.getByLabel('Calendar time zone').fill('America/Adak')
  await page.getByRole('button', { name: 'Save time zone' }).click()
  await expect(page.getByText('Calendar time zone saved.')).toBeVisible()
  const fileInput = page.getByLabel('FIT files')
  await fileInput.setInputFiles([
    { name: 'road-ride.fit', mimeType: 'application/octet-stream', buffer: readFileSync('tests/fixtures/road-ride.fit') },
    { name: 'partial-ride.fit', mimeType: 'application/octet-stream', buffer: readFileSync('tests/fixtures/partial-ride.fit') },
  ])
  await page.getByRole('button', { name: 'Import 2 FIT files' }).click()
  await expect(page.getByRole('heading', { name: 'road-ride' })).toBeVisible()

  const current = new Date()
  const target = new Date('2026-08-01T00:00:00Z')
  const monthsBack = (current.getUTCFullYear() - target.getUTCFullYear()) * 12 + current.getUTCMonth() - target.getUTCMonth()
  for (let index = 0; index < monthsBack; index += 1) await page.getByRole('button', { name: 'Previous month' }).click()
  await expect(page.getByRole('heading', { name: 'August 2026' })).toBeVisible()
  await page.getByRole('button', { name: /Tuesday, August 11, 2026, 2 completed rides/ }).click()
  await expect(page.getByRole('heading', { name: 'Tuesday, August 11, 2026' })).toBeVisible()
  await expect(page.getByRole('button', { name: /road-ride.*Completed Ride/ })).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'List', exact: true }).click()
  await expect(page.getByText(/Completed Ride · Aug 11, 2026/).first()).toBeVisible()
  await page.getByRole('button', { name: /road-ride.*Completed Ride/ }).first().click()
  await expect(page.locator('.calendar-ride-detail').getByRole('heading', { name: 'road-ride', level: 3 })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open ride management details' })).toBeVisible()

  const roadCard = page.locator('.goal-card').filter({ has: page.getByRole('heading', { name: 'road-ride', level: 3 }) })
  page.once('dialog', (dialog) => dialog.accept())
  await roadCard.getByRole('button', { name: 'Delete ride' }).click()
  await expect(page.getByRole('button', { name: /road-ride.*Completed Ride/ })).toHaveCount(0)
})

test('Cyclist manages dated FTP and daily recovery, and sees power load update when a Ride is deleted', async ({ page }) => {
  const email = `load-cyclist-${Date.now()}@example.test`
  await page.goto('/')
  await page.getByRole('button', { name: 'Create an account' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill('CyclePro-load-123')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.goto(await waitForAuthEmail(email, 'signup'))
  await expect(page.getByRole('heading', { name: 'Training load and recovery' })).toBeVisible()
  await expect(page.getByText(/No power load trend yet/)).toBeVisible()

  await page.getByLabel('FTP in watts').fill('250')
  await page.getByLabel('FTP effective date').fill('2026-08-01')
  await page.getByRole('button', { name: 'Save FTP' }).click()
  await expect(page.getByText(/250 W · Aug 1, 2026/)).toBeVisible()
  await page.getByLabel('FTP in watts').fill('255')
  await page.getByRole('button', { name: 'Save FTP' }).click()
  await expect(page.getByText(/255 W · Aug 1, 2026/)).toBeVisible()
  await expect(page.getByText(/250 W · Aug 1, 2026/)).toHaveCount(0)

  await page.getByLabel('Recovery feeling').selectOption('2')
  await page.getByLabel('Illness or injury today').check()
  await page.getByRole('button', { name: 'Save today’s check-in' }).click()
  await expect(page.getByText(/Low recovery; illness or injury reported/)).toBeVisible()
  await page.reload()
  await expect(page.getByText(/Low recovery; illness or injury reported/)).toBeVisible()

  const fileInput = page.getByLabel('FIT files')
  await fileInput.setInputFiles({ name: 'road-ride.fit', mimeType: 'application/octet-stream', buffer: readFileSync('tests/fixtures/road-ride.fit') })
  await page.getByRole('button', { name: 'Import 1 FIT file' }).click()
  await expect(page.getByText(/Power load on Aug 12, 2026: 51\.2 relative points/)).toBeVisible()
  await expect(page.getByText('CTL', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('ATL', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('TSB', { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/relative load trends, not a readiness or performance score/)).toBeVisible()
  await expect(page.getByText(/heart-rate load is not calculated/)).toBeVisible()
  await expect(page.getByText(/intensity suggestions should be suppressed/)).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  const roadCard = page.locator('.goal-card').filter({ has: page.getByRole('heading', { name: 'road-ride' }) })
  await roadCard.getByRole('button', { name: 'Delete ride' }).click()
  await expect(page.getByText(/No power load trend yet/)).toBeVisible()
})

test('Cyclist waits for a goal, then can skip the optional FTP setup assessment', async ({ page }) => {
  const email = `suggestion-setup-${Date.now()}@example.test`
  await page.goto('/')
  await page.getByRole('button', { name: 'Create an account' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill('CyclePro-suggest-123')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.goto(await waitForAuthEmail(email, 'signup'))
  await expect(page.getByRole('heading', { name: 'Today’s workout suggestion' })).toBeVisible()
  await expect(page.getByText('Set a Primary active goal to get a personalized workout suggestion.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Optional Zwift Ramp Test FTP assessment' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Set a goal' }).click()
  await page.getByLabel('Goal name').fill('Autumn sportive')
  await page.getByLabel('Event date').fill('2027-06-12')
  await page.getByRole('button', { name: 'Save primary goal' }).click()
  await expect(page.getByRole('heading', { name: 'Optional Zwift Ramp Test FTP assessment' })).toBeVisible()
  await expect(page.getByText(/manual FTP entry remains available/i)).toHaveCount(0)
  await expect(page.getByText(/record an FTP from another assessment method/)).toBeVisible()
  await page.getByRole('button', { name: 'Skip today' }).click()
  await expect(page.getByText('Skipped · not added to your calendar')).toBeVisible()
  await expect(page.getByText(/No completed Rides or planned workouts on this date/)).toBeVisible()
  await page.reload()
  await expect(page.getByText('Skipped · not added to your calendar')).toBeVisible()
  await expect(page.getByLabel('FTP in watts')).toBeVisible()
})

test('Cyclist gets one explained workout, accepts it into the calendar, and illness suppresses an unaccepted assessment', async ({ page }) => {
  const email = `suggestion-workout-${Date.now()}@example.test`
  await page.goto('/')
  await page.getByRole('button', { name: 'Create an account' }).click()
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill('CyclePro-suggest-456')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.goto(await waitForAuthEmail(email, 'signup'))

  await page.getByLabel('FTP in watts').fill('250')
  await page.getByLabel('FTP effective date').fill('2026-08-01')
  await page.getByRole('button', { name: 'Save FTP' }).click()
  await expect(page.getByText(/250 W · Aug 1, 2026/)).toBeVisible()
  const input = page.getByLabel('FIT files')
  await input.setInputFiles({ name: 'road-ride.fit', mimeType: 'application/octet-stream', buffer: readFileSync('tests/fixtures/road-ride.fit') })
  await page.getByRole('button', { name: 'Import 1 FIT file' }).click()
  await expect(page.getByRole('heading', { name: 'road-ride' })).toBeVisible()
  await page.getByRole('button', { name: 'Set a goal' }).click()
  await page.getByLabel('Goal name').fill('Autumn sportive')
  await page.getByLabel('Event date').fill('2027-06-12')
  await page.getByRole('button', { name: 'Save primary goal' }).click()

  await expect(page.getByRole('heading', { name: 'Steady endurance ride' })).toBeVisible()
  await expect(page.getByText(/Autumn sportive event on 2027-06-12 is the current goal/)).toBeVisible()
  await expect(page.getByText(/recent relative load trends are CTL .* ATL .* TSB/)).toBeVisible()
  await page.getByRole('button', { name: 'Accept and add to calendar' }).click()
  await expect(page.getByText('Accepted · planned on your calendar')).toBeVisible()
  await expect(page.getByText('Planned workout · 60 min')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Accepted · planned on your calendar')).toBeVisible()
  await expect(page.getByText('Planned workout · 60 min')).toBeVisible()

  await page.getByRole('button', { name: 'Sign out' }).click()
  const illEmail = `suggestion-ill-${Date.now()}@example.test`
  await page.getByRole('button', { name: 'Create an account' }).click()
  await page.getByLabel('Email address').fill(illEmail)
  await page.getByLabel('Password').fill('CyclePro-suggest-789')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.goto(await waitForAuthEmail(illEmail, 'signup'))
  await page.getByLabel('Illness or injury today').check()
  await page.getByRole('button', { name: 'Save today’s check-in' }).click()
  await expect(page.getByText(/illness or injury reported/)).toBeVisible()
  await page.getByRole('button', { name: 'Set a goal' }).click()
  await page.getByLabel('Goal name').fill('Recovery block')
  await page.getByLabel('Event date').fill('2027-06-12')
  await page.getByRole('button', { name: 'Save primary goal' }).click()
  await expect(page.getByText(/Workout intensity and the FTP assessment are withheld today/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Optional Zwift Ramp Test FTP assessment' })).toHaveCount(0)
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

    const directRideCreateResponse = await fetch(`${url}/rest/v1/rides`, {
      method: 'POST',
      headers: { apikey: anonKey, authorization: `Bearer ${firstSession.access_token}`, 'content-type': 'application/json', prefer: 'return=representation' },
      body: JSON.stringify({
        cyclist_id: first.id,
        file_sha256: 'a'.repeat(64),
        activity_name: 'Private ride',
        started_at: '2026-08-12T06:30:00.000Z',
        duration_seconds: 3600,
        average_power_watts: 185,
        notes: '',
      }),
    })
    expect(directRideCreateResponse.ok).toBe(false)
    const rideCreateResponse = await fetch(`${url}/rest/v1/rides`, {
      method: 'POST',
      headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}`, 'content-type': 'application/json', prefer: 'return=representation' },
      body: JSON.stringify({
        cyclist_id: first.id,
        file_sha256: 'b'.repeat(64),
        activity_name: 'Private ride',
        started_at: '2026-08-12T06:30:00.000Z',
        duration_seconds: 3600,
        average_power_watts: 185,
        notes: '',
      }),
    })
    expect(rideCreateResponse.ok).toBe(true)
    const [privateRide] = await rideCreateResponse.json() as Array<{ id: string }>
    const secondRideResponse = await fetch(`${url}/rest/v1/rides?select=id`, {
      headers: { apikey: anonKey, authorization: `Bearer ${secondSession.access_token}` },
    })
    expect(await secondRideResponse.json()).toEqual([])
    const sensorMutation = await fetch(`${url}/rest/v1/rides?id=eq.${privateRide.id}`, {
      method: 'PATCH',
      headers: { apikey: anonKey, authorization: `Bearer ${firstSession.access_token}`, 'content-type': 'application/json', prefer: 'return=representation' },
      body: JSON.stringify({ average_power_watts: 999 }),
    })
    expect(sensorMutation.ok).toBe(false)
    const unauthorizedNotesMutation = await fetch(`${url}/rest/v1/rides?id=eq.${privateRide.id}`, {
      method: 'PATCH',
      headers: { apikey: anonKey, authorization: `Bearer ${secondSession.access_token}`, 'content-type': 'application/json', prefer: 'return=representation' },
      body: JSON.stringify({ notes: 'Private change' }),
    })
    expect(unauthorizedNotesMutation.ok).toBe(true)
    const ownerRideResponse = await fetch(`${url}/rest/v1/rides?id=eq.${privateRide.id}&select=average_power_watts,notes`, {
      headers: { apikey: anonKey, authorization: `Bearer ${firstSession.access_token}` },
    })
    expect(await ownerRideResponse.json()).toEqual([{ average_power_watts: 185, notes: '' }])

    for (const [table, values] of [
      ['ftp_records', { ftp_watts: 250, set_on: '2026-08-01' }],
      ['daily_recovery_checkins', { checkin_date: '2026-08-12', perceived_recovery: 2, illness_or_injury: true }],
      ['workout_suggestions', { suggestion_date: '2026-08-12', suggestion_type: 'workout', workout_type: 'Private planned ride', duration_minutes: 60, intensity_target: 'Easy', explanation: 'Private goal and load explanation.', status: 'accepted' }],
    ] as const) {
      const createResponse = await fetch(`${url}/rest/v1/${table}`, {
        method: 'POST',
        headers: { apikey: anonKey, authorization: `Bearer ${firstSession.access_token}`, 'content-type': 'application/json', prefer: 'return=representation' },
        body: JSON.stringify({ cyclist_id: first.id, ...values }),
      })
      expect(createResponse.ok).toBe(true)
      const ownerListResponse = await fetch(`${url}/rest/v1/${table}?select=cyclist_id`, {
        headers: { apikey: anonKey, authorization: `Bearer ${secondSession.access_token}` },
      })
      expect(await ownerListResponse.json()).toEqual([])
    }

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
