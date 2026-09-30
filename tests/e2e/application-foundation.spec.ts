import { expect, test } from '@playwright/test'

test('Cyclist can open the app and see API and Supabase status', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Cycle Pro' })).toBeVisible()
  await expect(page.getByText('Online', { exact: true })).toBeVisible()
  await expect(page.getByText(/^(Connected|Not configured|Unavailable)$/)).toBeVisible()
})

test('Cyclist gets a retry option when the API is unavailable', async ({ page }) => {
  await page.route('**/api/healthz', (route) => route.abort())
  await page.goto('/')

  await expect(page.getByRole('definition').first()).toHaveText('Unavailable')
  await expect(page.getByRole('button', { name: 'Retry connection check' })).toBeVisible()
})
