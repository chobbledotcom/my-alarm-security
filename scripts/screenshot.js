const { spawn } = require('child_process');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { prep } = require('./prepare-dev');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');
const PORT = 8080;

const pages = [
  { name: 'homepage', url: '/' },
  { name: 'product-basic-system', url: '/products/basic-system-539/' },
  { name: 'contact', url: '/pages/contact/' }
];

async function waitForServer(port, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      if (response.ok) return true;
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Server did not start within ${timeout}ms`);
}

async function takeScreenshots() {
  console.log('Preparing site...');
  prep();

  console.log('Starting Eleventy server...');
  const dev = path.join(__dirname, '..', '.build', 'dev');
  const server = spawn('npx', ['-y', '@11ty/eleventy', '--serve', '--port', PORT.toString()], {
    cwd: dev,
    shell: true,
    stdio: 'pipe'
  });

  try {
    await waitForServer(PORT);
    console.log('Server ready!');

    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    for (const { name, url } of pages) {
      console.log(`Taking screenshot: ${name}...`);
      const fullUrl = `http://localhost:${PORT}${url}`;
      await page.goto(fullUrl, { waitUntil: 'networkidle0' });

      const screenshotPath = path.join(SCREENSHOT_DIR, `${name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  Saved: ${screenshotPath}`);
    }

    await browser.close();
    console.log('\nAll screenshots taken successfully!');
  } finally {
    server.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(0);
  }
}

takeScreenshots().catch(err => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
