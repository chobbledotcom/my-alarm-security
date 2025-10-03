#!/usr/bin/env node

/**
 * Main orchestrator for the site conversion process
 * This coordinates all the individual converters
 */

const { convertPages, convertBlogPosts, convertProducts, convertCategories, convertHomeContent } = require('./converters');

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
 * Main execution function
 */
const main = () => {
  console.log('Starting conversion of old MyAlarm Security site...\n');

  const startTime = Date.now();
  const results = {};

  try {
    // Convert homepage content first
    results.home = convertHomeContent();
    console.log('');

    // Convert all content types
    results.pages = convertPages();
    console.log('');

    results.blog = convertBlogPosts();
    console.log('');

    results.products = convertProducts();
    console.log('');

    results.categories = convertCategories();
    console.log('');

    // Display summary
    console.log('='.repeat(50));
    console.log('Conversion Summary:');
    console.log('='.repeat(50));

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