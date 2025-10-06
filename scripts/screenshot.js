const { spawn, execSync } = require('child_process');
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

function checkCommand(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkDependencies() {
  const missing = [];

  if (!checkCommand('rsync')) {
    missing.push('rsync');
  }

  const chromeLibs = [
    'libnspr4.so',
    'libnss3.so',
    'libgbm.so.1',
    'libgtk-3.so.0'
  ];

  const missingLibs = chromeLibs.filter(lib => {
    try {
      execSync(`ldconfig -p | grep -q ${lib}`, { stdio: 'ignore', shell: true });
      return false;
    } catch {
      return true;
    }
  });

  if (missingLibs.length > 0) {
    missing.push('chrome-dependencies');
  }

  if (missing.length > 0) {
    console.error('\n❌ Missing dependencies detected!\n');

    if (missing.includes('rsync')) {
      console.error('Missing: rsync');
    }

    if (missing.includes('chrome-dependencies')) {
      console.error('Missing: Chrome/Chromium system libraries');
    }

    console.error('\n📦 To install all required dependencies on Ubuntu/Debian:\n');
    console.error('sudo apt-get update && sudo apt-get install -y \\');
    console.error('  rsync \\');
    console.error('  ca-certificates \\');
    console.error('  fonts-liberation \\');
    console.error('  libasound2t64 \\');
    console.error('  libatk-bridge2.0-0 \\');
    console.error('  libatk1.0-0 \\');
    console.error('  libcairo2 \\');
    console.error('  libcups2 \\');
    console.error('  libdbus-1-3 \\');
    console.error('  libgbm1 \\');
    console.error('  libglib2.0-0 \\');
    console.error('  libgtk-3-0 \\');
    console.error('  libnspr4 \\');
    console.error('  libnss3 \\');
    console.error('  libx11-6 \\');
    console.error('  libxcomposite1 \\');
    console.error('  libxdamage1 \\');
    console.error('  libxrandr2 \\');
    console.error('  xdg-utils\n');

    process.exit(1);
  }
}

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
