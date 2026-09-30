import { expect, test } from '@playwright/test'

test('Cyclist can open the app and see that the API is online', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Train with the whole picture.' }),
  ).toBeVisible()
  await expect(page.getByText('API connection is online')).toBeVisible()
})

test('Cyclist gets a retry option when the API is unavailable', async ({ page }) => {
  await page.route('**/api/healthz', (route) => route.abort())
  await page.goto('/')

  await expect(page.getByText('API connection is unavailable')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
})
