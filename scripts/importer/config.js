const path = require('path');

// Configuration for the importer
const config = {
  OLD_SITE_PATH: path.join(__dirname, '../../old_site'),
  OUTPUT_BASE: path.join(__dirname, '../..'),

  // Default values for content
  DEFAULT_DATE: '2020-01-01',

  // Paths for different content types
  paths: {
    pages: 'pages',
    news: 'blog', // Output directory for blog posts
    products: 'products',
    categories: 'categories',
    blog: 'blog', // Source directory in old site
    favicon: 'assets/favicon'
  }
};

module.exports = config;