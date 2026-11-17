/**
 * Captures real screenshots of the running app at desktop and mobile widths.
 * Requires the backend demo server and Next.js dev server to be running.
 * Usage: node scripts/capture-screenshots.mjs
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.APP_URL ?? 'http://localhost:3000';
const OUT = join(process.cwd(), 'screenshots');
const EMAIL = process.env.DEMO_ADMIN_EMAIL ?? 'admin@doctortracker.local';
const PASSWORD = process.env.DEMO_ADMIN_PASSWORD ?? 'Admin12345!';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  // Use the locally installed Chrome so no extra browser download is required.
  executablePath: process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});

async function capture(name, url, viewport, fullPage = true) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.getByLabel('Email address').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(OUT, name), fullPage });
  console.log(`Captured ${name}`);
  await context.close();
}

const desktop = { width: 1440, height: 900 };
const mobile = { width: 390, height: 844 };

await capture('dashboard-desktop.png', '/dashboard', desktop);
await capture('doctors-desktop.png', '/doctors', desktop);
await capture('patients-desktop.png', '/patients', desktop);
await capture('dashboard-mobile.png', '/dashboard', mobile);
await capture('doctors-mobile.png', '/doctors', mobile);
await capture('patients-mobile.png', '/patients', mobile);

await browser.close();
console.log('Screenshots saved to', OUT);
