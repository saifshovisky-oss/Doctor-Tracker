import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

let password = '';
for (const line of readFileSync('../doctor-tracker-backend/.env', 'utf8').split(/\r?\n/)) {
  if (line.startsWith('ADMIN_PASSWORD=')) password = line.slice('ADMIN_PASSWORD='.length);
}
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/login');
await page.getByLabel('Email address').fill('admin@doctortracker.local');
await page.locator('#password').fill(password);
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL('**/dashboard');

await page.getByRole('link', { name: /total patients/i }).click();
await page.waitForURL('**/patients');
console.log('[card] total patients ->', new URL(page.url()).pathname);

await page.goto('http://localhost:3000/dashboard');
await page.getByRole('link', { name: /total doctors/i }).click();
await page.waitForURL('**/doctors');
console.log('[card] total doctors ->', new URL(page.url()).pathname);

await page.goto('http://localhost:3000/dashboard');
const logo = await page.locator('aside svg[aria-label="Doctor Tracker"]').count();
const text = await page.locator('aside').innerText();
console.log('[sidebar] logo count:', logo, '| has Doctor Tracker text:', text.includes('Doctor Tracker'));
await browser.close();
