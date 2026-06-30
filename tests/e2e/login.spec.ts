import { test, expect } from '@playwright/test'

async function fillValidLogin(page: import('@playwright/test').Page) {
  await page.locator('input[name="email"]').fill('admin@hrisense.local')
  await page.locator('input[name="password"]').fill('password123')
}

test.describe('Login Flow', () => {
  test('renders login page', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('h1')).toHaveText('HRiSENSE')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    await page.goto('/login')

    await page.locator('button[type="submit"]').click()

    await expect(page.locator('input[name="email"]')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('input[name="password"]')).toHaveAttribute('aria-invalid', 'true')
  })

  test('redirects to dashboard in mock mode', async ({ page }) => {
    await page.goto('/login')
    await fillValidLogin(page)

    await page.locator('button[type="submit"]').click()

    await page.waitForURL('**/dashboard', { timeout: 10000 })
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('shows mock badge when mock mode is enabled', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByText(/Mock Data/)).toBeVisible()
  })
})
