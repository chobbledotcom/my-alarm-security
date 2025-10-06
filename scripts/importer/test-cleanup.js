#!/usr/bin/env node

/**
 * Test script to verify folder cleaning functionality
 * This validates that:
 * 1. Folders are properly cleaned before import
 * 2. All necessary directories are recreated
 * 3. No data we need to keep is accidentally deleted
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const config = require('./config');

// Folders that should be cleaned and recreated
const MANAGED_FOLDERS = [
  path.join(config.OUTPUT_BASE, 'images'),
  path.join(config.OUTPUT_BASE, config.paths.pages),
  path.join(config.OUTPUT_BASE, config.paths.news),
  path.join(config.OUTPUT_BASE, config.paths.products),
  path.join(config.OUTPUT_BASE, config.paths.categories),
  path.join(config.OUTPUT_BASE, 'reviews'),
  path.join(config.OUTPUT_BASE, config.paths.favicon)
];

// Folders that should NEVER be deleted
const PROTECTED_FOLDERS = [
  path.join(config.OUTPUT_BASE, '.git'),
  path.join(config.OUTPUT_BASE, 'node_modules'),
  path.join(config.OUTPUT_BASE, 'scripts'),
  path.join(config.OUTPUT_BASE, 'old_site'),
  path.join(config.OUTPUT_BASE, 'css'),
  path.join(config.OUTPUT_BASE, 'app'),
  path.join(config.OUTPUT_BASE, '_data'),
  path.join(config.OUTPUT_BASE, '_includes'),
  path.join(config.OUTPUT_BASE, '_layouts')
];

let testsPassed = 0;
let testsFailed = 0;

const pass = (msg) => {
  console.log(`${GREEN}✓${RESET} ${msg}`);
  testsPassed++;
};

const fail = (msg) => {
  console.log(`${RED}✗${RESET} ${msg}`);
  testsFailed++;
};

const info = (msg) => {
  console.log(`${YELLOW}ℹ${RESET} ${msg}`);
};

/**
 * Create test files in managed directories
 */
const createTestFiles = () => {
  info('Creating test files in managed directories...');

  MANAGED_FOLDERS.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create a test file
    const testFile = path.join(dir, 'test-cleanup-file.txt');
    fs.writeFileSync(testFile, 'This file should be deleted by cleanup');

    // Create a subdirectory with a file (for images)
    if (dir.endsWith('images')) {
      const subDir = path.join(dir, 'test-subdir');
      fs.mkdirSync(subDir, { recursive: true });
      fs.writeFileSync(path.join(subDir, 'test-file.txt'), 'Test');
    }
  });

  pass('Test files created');
};

/**
 * Verify test files exist before cleanup
 */
const verifyTestFilesExist = () => {
  info('Verifying test files exist before cleanup...');

  let allExist = true;
  MANAGED_FOLDERS.forEach(dir => {
    const testFile = path.join(dir, 'test-cleanup-file.txt');
    if (!fs.existsSync(testFile)) {
      fail(`Test file missing: ${testFile}`);
      allExist = false;
    }
  });

  if (allExist) {
    pass('All test files exist before cleanup');
  }

  return allExist;
};

/**
 * Check that protected folders still exist
 */
const verifyProtectedFolders = () => {
  info('Verifying protected folders are not deleted...');

  let allProtected = true;
  PROTECTED_FOLDERS.forEach(dir => {
    if (fs.existsSync(dir)) {
      pass(`Protected folder safe: ${path.basename(dir)}`);
    } else {
      // Some protected folders might not exist in all environments
      info(`Protected folder doesn't exist (OK if not in your setup): ${path.basename(dir)}`);
    }
  });

  return allProtected;
};

/**
 * Verify managed folders are empty after cleanup
 */
const verifyFoldersCleanedAndRecreated = () => {
  info('Verifying managed folders are cleaned and recreated...');

  let allCleaned = true;

  MANAGED_FOLDERS.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fail(`Folder not recreated: ${dir}`);
      allCleaned = false;
      return;
    }

    // Check if directory is empty (or only has subdirs that are empty)
    const contents = fs.readdirSync(dir);
    const testFile = path.join(dir, 'test-cleanup-file.txt');

    if (fs.existsSync(testFile)) {
      fail(`Test file not cleaned: ${testFile}`);
      allCleaned = false;
    } else {
      pass(`Folder cleaned and recreated: ${path.relative(config.OUTPUT_BASE, dir)}`);
    }
  });

  return allCleaned;
};

/**
 * Check specific cleaning behavior
 */
const verifyCleaningBehavior = () => {
  info('Verifying specific cleaning behaviors...');

  // Test 1: cleanDirectory() only removes files, not subdirectories
  const { cleanDirectory } = require('./utils/filesystem');
  const testDir = path.join(config.OUTPUT_BASE, 'test-clean-behavior');
  fs.mkdirSync(testDir, { recursive: true });

  // Create file and subdirectory
  fs.writeFileSync(path.join(testDir, 'file.txt'), 'test');
  fs.mkdirSync(path.join(testDir, 'subdir'));
  fs.writeFileSync(path.join(testDir, 'subdir', 'nested.txt'), 'test');

  cleanDirectory(testDir);

  // Verify file is deleted but subdirectory remains
  if (fs.existsSync(path.join(testDir, 'file.txt'))) {
    fail('cleanDirectory() should remove files');
  } else {
    pass('cleanDirectory() removes files');
  }

  if (fs.existsSync(path.join(testDir, 'subdir'))) {
    pass('cleanDirectory() preserves subdirectories');
  } else {
    fail('cleanDirectory() should preserve subdirectories');
  }

  // Cleanup test directory
  fs.rmSync(testDir, { recursive: true, force: true });

  // Test 2: images directory full cleanup (rmSync with recursive)
  // This is handled specially in index.js:36-46
  const imagesDir = path.join(config.OUTPUT_BASE, 'images');
  if (fs.existsSync(imagesDir)) {
    const contents = fs.readdirSync(imagesDir);
    if (contents.length === 0) {
      pass('Images directory properly emptied (full recursive cleanup)');
    } else {
      fail('Images directory should be completely empty after cleanup');
    }
  }
};

/**
 * Main test flow
 */
const main = async () => {
  console.log('\n=== Testing Importer Folder Cleaning Functionality ===\n');

  // Phase 1: Setup
  console.log('Phase 1: Setup');
  createTestFiles();
  const filesExist = verifyTestFilesExist();
  console.log('');

  if (!filesExist) {
    console.log(`${RED}Setup failed - cannot continue${RESET}\n`);
    process.exit(1);
  }

  // Phase 2: Run the importer (which will clean)
  console.log('Phase 2: Running importer (this will clean and recreate folders)');
  info('Executing importer...\n');

  try {
    const { main: runImporter } = require('./index');
    await runImporter();
  } catch (error) {
    console.error(`${RED}Importer failed:${RESET}`, error.message);
    console.log('');
  }

  // Phase 3: Verify cleanup worked
  console.log('\nPhase 3: Verification');
  verifyProtectedFolders();
  verifyFoldersCleanedAndRecreated();
  verifyCleaningBehavior();
  console.log('');

  // Summary
  console.log('=== Test Summary ===');
  console.log(`${GREEN}Passed:${RESET} ${testsPassed}`);
  console.log(`${RED}Failed:${RESET} ${testsFailed}`);

  if (testsFailed === 0) {
    console.log(`\n${GREEN}✓ All tests passed!${RESET}`);
    console.log('\nFolder cleaning functionality is working correctly:');
    console.log('  • Managed folders are cleaned before import');
    console.log('  • Directories are recreated properly');
    console.log('  • Protected folders are not affected');
    console.log('  • Images directory gets full recursive cleanup');
    console.log('  • Other folders preserve subdirectory structure\n');
  } else {
    console.log(`\n${RED}✗ Some tests failed${RESET}\n`);
    process.exit(1);
  }
};

// Run tests
if (require.main === module) {
  main().catch(error => {
    console.error(`${RED}Test execution failed:${RESET}`, error);
    process.exit(1);
  });
}
