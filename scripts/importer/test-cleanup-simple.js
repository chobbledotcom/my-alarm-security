#!/usr/bin/env node

/**
 * Simple test to verify folder cleaning functionality
 * Tests that folders are cleaned before import and properly recreated
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

// Folders managed by the importer
const MANAGED_FOLDERS = [
  { path: 'images', cleaning: 'full' },
  { path: config.paths.pages, cleaning: 'files-only' },
  { path: config.paths.news, cleaning: 'files-only' },
  { path: config.paths.products, cleaning: 'files-only' },
  { path: config.paths.categories, cleaning: 'files-only' },
  { path: 'reviews', cleaning: 'files-only' },
  { path: config.paths.favicon, cleaning: 'files-only' }
];

console.log('\n=== Folder Cleaning Test ===\n');

// Create test markers
console.log('Creating test marker files...');
MANAGED_FOLDERS.forEach(({ path: folderPath }) => {
  const dir = path.join(config.OUTPUT_BASE, folderPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, '__test_marker__.txt'), 'DELETE ME');
});
console.log(`${GREEN}✓${RESET} Created test markers in ${MANAGED_FOLDERS.length} folders\n`);

// Verify markers exist
console.log('Verifying test markers exist...');
let allExist = true;
MANAGED_FOLDERS.forEach(({ path: folderPath }) => {
  const markerPath = path.join(config.OUTPUT_BASE, folderPath, '__test_marker__.txt');
  if (!fs.existsSync(markerPath)) {
    console.log(`${RED}✗${RESET} Missing: ${markerPath}`);
    allExist = false;
  }
});
if (allExist) {
  console.log(`${GREEN}✓${RESET} All markers exist before cleanup\n`);
}

console.log('Now run the importer with: npm run convert-old-site');
console.log('\nAfter running, use this command to verify cleanup:');
console.log('  node scripts/importer/verify-cleanup.js\n');
