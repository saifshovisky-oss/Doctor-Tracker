/**
 * Captures real screenshots of the running app at desktop and mobile widths.
 * Requires the backend demo server and Next.js dev server to be running.
 * Usage: node scripts/capture-screenshots.mjs
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Minimal .env reader so no extra dependency is needed.
try {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
  }
} catch {}

const BASE = process.env.APP_URL ?? 'http://localhost:3000';
const OUT = join(process.cwd(), 'screenshots');
const EMAIL = process.env.DEMO_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? 'admin@doctortracker.local';
const PASSWORD = process.env.DEMO_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;
if (!PASSWORD) throw new Error('Set DEMO_ADMIN_PASSWORD (or ADMIN_PASSWORD in .env) before capturing screenshots.');

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
  let target = url;
  if (target.includes('<id>')) {
    await page.goto(`${BASE}/doctors`, { waitUntil: 'networkidle' });
    const link = await page.locator('a[href^="/doctors/"]').first().getAttribute('href');
    target = link ?? '/doctors';
  }
  await page.goto(`${BASE}${target}`, { waitUntil: 'networkidle' });
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
await capture('doctor-details-desktop.png', '/doctors/<id>', desktop); // replaced below
await capture('dashboard-mobile.png', '/dashboard', mobile);
await capture('doctors-mobile.png', '/doctors', mobile);
await capture('patients-mobile.png', '/patients', mobile);

await browser.close();
console.log('Screenshots saved to', OUT);
