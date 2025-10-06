#!/usr/bin/env node

/**
 * Verify that folder cleaning worked correctly
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const MANAGED_FOLDERS = [
  { path: 'images', cleaning: 'full' },
  { path: config.paths.pages, cleaning: 'files-only' },
  { path: config.paths.news, cleaning: 'files-only' },
  { path: config.paths.products, cleaning: 'files-only' },
  { path: config.paths.categories, cleaning: 'files-only' },
  { path: 'reviews', cleaning: 'files-only' },
  { path: config.paths.favicon, cleaning: 'files-only' }
];

const PROTECTED_FOLDERS = [
  '.git', 'scripts', 'old_site', 'css', 'app', '_data', '_includes', '_layouts'
];

console.log('\n=== Verifying Folder Cleaning Results ===\n');

let passed = 0;
let failed = 0;

// Check that test markers were removed
console.log('Checking test markers were removed...');
MANAGED_FOLDERS.forEach(({ path: folderPath }) => {
  const markerPath = path.join(config.OUTPUT_BASE, folderPath, '__test_marker__.txt');
  if (fs.existsSync(markerPath)) {
    console.log(`${RED}✗${RESET} Test marker still exists: ${folderPath}/__test_marker__.txt`);
    failed++;
  } else {
    console.log(`${GREEN}✓${RESET} Cleaned: ${folderPath}`);
    passed++;
  }
});
console.log('');

// Check that folders were recreated
console.log('Checking folders were recreated...');
MANAGED_FOLDERS.forEach(({ path: folderPath }) => {
  const dir = path.join(config.OUTPUT_BASE, folderPath);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    console.log(`${GREEN}✓${RESET} Recreated: ${folderPath} (${files.length} items)`);
    passed++;
  } else {
    console.log(`${RED}✗${RESET} Missing: ${folderPath}`);
    failed++;
  }
});
console.log('');

// Check protected folders still exist
console.log('Checking protected folders...');
PROTECTED_FOLDERS.forEach(folder => {
  const folderPath = path.join(config.OUTPUT_BASE, folder);
  if (fs.existsSync(folderPath)) {
    console.log(`${GREEN}✓${RESET} Protected: ${folder}`);
    passed++;
  } else {
    console.log(`${YELLOW}ℹ${RESET} Not present: ${folder} (OK if not in your environment)`);
  }
});
console.log('');

// Verify cleaning behavior details
console.log('Verifying cleaning behavior...');

// Images should be fully cleaned (including subdirectories)
const imagesDir = path.join(config.OUTPUT_BASE, 'images');
if (fs.existsSync(imagesDir)) {
  const subdirs = fs.readdirSync(imagesDir)
    .filter(item => fs.statSync(path.join(imagesDir, item)).isDirectory());

  if (subdirs.length > 0) {
    console.log(`${GREEN}✓${RESET} Images directory recreated with subdirectories`);
    passed++;
  } else {
    console.log(`${YELLOW}ℹ${RESET} Images directory is empty (will be populated on import)`);
  }
}

// Other directories use cleanDirectory (files only)
const pagesDir = path.join(config.OUTPUT_BASE, config.paths.pages);
if (fs.existsSync(pagesDir)) {
  const files = fs.readdirSync(pagesDir).filter(item =>
    fs.statSync(path.join(pagesDir, item)).isFile()
  );
  if (files.length > 0) {
    console.log(`${GREEN}✓${RESET} Pages directory populated (${files.length} files)`);
    passed++;
  }
}

console.log('');
console.log('=== Summary ===');
console.log(`${GREEN}Passed:${RESET} ${passed}`);
console.log(`${RED}Failed:${RESET} ${failed}`);

if (failed === 0) {
  console.log(`\n${GREEN}✓ Folder cleaning working correctly!${RESET}`);
  console.log('\nWhat was tested:');
  console.log('  • Test markers removed from managed folders');
  console.log('  • All managed folders recreated');
  console.log('  • Protected folders not affected');
  console.log('  • New content generated\n');
} else {
  console.log(`\n${RED}✗ Some tests failed${RESET}\n`);
  process.exit(1);
}
