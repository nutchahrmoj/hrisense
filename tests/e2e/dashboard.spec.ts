import { test, expect } from '@playwright/test'

async function loginInMockMode(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.locator('input[name="email"]').fill('admin@hrisense.local')
  await page.locator('input[name="password"]').fill('password123')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/dashboard', { timeout: 10000 })
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginInMockMode(page)
  })

  test('loads dashboard page', async ({ page }) => {
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('shows sidebar navigation', async ({ page }) => {
    await expect(page.locator('nav').first()).toBeVisible()
  })

  test('navigates to personnel page', async ({ page }) => {
    await page.locator('a[href="/personnel"]').first().click()
    await page.waitForURL('**/personnel**', { timeout: 10000 })
    await expect(page).toHaveURL(/.*personnel/)
  })

  test('shows KPI cards', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="kpi"]')
    await expect(cards.first()).toBeVisible()
    expect(await cards.count()).toBeGreaterThan(0)
  })
})
