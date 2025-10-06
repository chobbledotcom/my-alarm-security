#!/usr/bin/env node

/**
 * Main orchestrator for the site conversion process
 * This coordinates all the individual converters
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { convertPages, convertBlogPosts, convertProducts, convertCategories, convertHomeContent } = require('./converters');
const { extractFavicons } = require('./utils/favicon-extractor');
const config = require('./config');

/**
 * Check if pandoc is installed
 * @throws {Error} If pandoc is not found
 */
const checkPandoc = () => {
  try {
    execSync('pandoc --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('\n❌ ERROR: pandoc is not installed!');
    console.error('   Please install pandoc before running the importer:');
    console.error('   - Ubuntu/Debian: sudo apt-get install pandoc');
    console.error('   - macOS: brew install pandoc');
    console.error('   - Windows: https://pandoc.org/installing.html\n');
    process.exit(1);
  }
};

/**
 * Display conversion results
 * @param {string} type - Content type
 * @param {Object} results - Conversion results
 */
const displayResults = (type, results) => {
  if (results.total === 0) {
    return;
  }

  const status = results.failed > 0 ? '⚠️' : '✅';
  console.log(`${status} ${type}: ${results.successful}/${results.total} converted`);

  if (results.failed > 0) {
    console.log(`   Failed: ${results.failed} files`);
  }
};

/**
 * Clean the images directory before importing
 */
const cleanImagesDirectory = () => {
  const imagesDir = path.join(__dirname, '..', '..', 'images');

  if (fs.existsSync(imagesDir)) {
    console.log('Cleaning images directory...');
    fs.rmSync(imagesDir, { recursive: true, force: true });
    console.log('✓ Images directory cleaned\n');
  }

  // Recreate empty directory
  fs.mkdirSync(imagesDir, { recursive: true });
};

/**
 * Main execution function
 */
const main = async () => {
  console.log('Starting conversion of old MyAlarm Security site...\n');

  // Check for required dependencies
  checkPandoc();

  const startTime = Date.now();
  const results = {};

  try {
    // Clean images directory first
    cleanImagesDirectory();

    // Extract favicons
    const oldSitePath = config.OLD_SITE_PATH;
    const faviconOutputPath = path.join(config.OUTPUT_BASE, config.paths.favicon);
    results.favicons = extractFavicons(oldSitePath, faviconOutputPath);
    console.log('');

    // Convert homepage content first
    results.home = convertHomeContent();
    console.log('');

    // Convert all content types
    results.pages = await convertPages();
    console.log('');

    results.blog = convertBlogPosts();
    console.log('');

    results.products = await convertProducts();
    console.log('');

    results.categories = await convertCategories();
    console.log('');

    // Display summary
    console.log('='.repeat(50));
    console.log('Conversion Summary:');
    console.log('='.repeat(50));

    displayResults('Favicons', results.favicons);
    displayResults('Homepage Content', results.home);
    displayResults('Pages', results.pages);
    displayResults('Blog Posts', results.blog);
    displayResults('Products', results.products);
    displayResults('Categories', results.categories);

    const totalConverted = Object.values(results).reduce((sum, r) => sum + r.successful, 0);
    const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('='.repeat(50));
    console.log(`Total files converted: ${totalConverted}`);
    if (totalFailed > 0) {
      console.log(`Total files failed: ${totalFailed}`);
    }
    console.log(`Time elapsed: ${elapsedTime} seconds`);
    console.log('\n✨ Conversion completed successfully!');

    process.exit(totalFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Error during conversion:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };