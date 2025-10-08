const { PRODUCT_ORDER } = require('../constants');

/**
 * Configuration for page-specific layouts, navigation, and metadata
 */
const PAGE_CONFIG = {
  'about-us': {
    nav: {key: 'About', order: 2}
  },
  'contact': {
    layout: 'contact.html',
    nav: {key: 'Contact', order: 99}
  },
  'reviews': {
    layout: 'reviews.html',
    nav: {key: 'Reviews', order: 98}
  }
};

/**
 * Generate frontmatter for page content
 * @param {Object} metadata - Extracted metadata
 * @param {string} slug - Page slug
 * @param {string} pageHeading - The H1 heading from page content
 * @returns {string} Frontmatter YAML
 */
const generatePageFrontmatter = (metadata, slug, pageHeading = null) => {
  const pageConfig = PAGE_CONFIG[slug] || {};
  const layout = pageConfig.layout || 'page';

  // Root-level pages don't need /pages/ prefix
  const rootPages = ['contact', 'reviews'];
  const permalink = rootPages.includes(slug) ? `/${slug}/` : `/pages/${slug}/`;

  // Use the actual H1 from content for header_text, fallback to breadcrumb or title
  const headerText = pageHeading || metadata.header_text || metadata.title || '';

  let frontmatter = `---
header_text: "${headerText}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "${permalink}"
layout: ${layout}`;

  // Add navigation if configured
  if (pageConfig.nav) {
    frontmatter += `
eleventyNavigation:
  key: ${pageConfig.nav.key}
  order: ${pageConfig.nav.order}`;
  }

  frontmatter += '\n---';
  return frontmatter;
};

/**
 * Generate frontmatter for blog/news content
 * @param {Object} metadata - Extracted metadata
 * @param {string} slug - Post slug
 * @param {string} date - Post date
 * @param {string} blogHeading - The H1 heading from blog post content
 * @returns {string} Frontmatter YAML
 */
const generateBlogFrontmatter = (metadata, slug, date, blogHeading = null) => {
  // Use the actual H1 from content for header_text, fallback to breadcrumb or title
  const headerText = blogHeading || metadata.header_text || metadata.title || '';
  const postTitle = metadata.header_text || slug.replace(/-/g, ' ');

  return `---
title: "${postTitle}"
date: ${date}
header_text: "${headerText}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/blog/${slug}/"
---`;
};

/**
 * Generate frontmatter for product content
 * @param {Object} metadata - Extracted metadata
 * @param {string} slug - Product slug
 * @param {string} price - Product price
 * @param {string[]|string} categories - Product categories (array or single string)
 * @param {string} productName - Product name
 * @param {Object} images - Product images with local paths
 * @param {string} productHeading - The H1 heading from product content
 * @returns {string} Frontmatter YAML
 */
const generateProductFrontmatter = (metadata, slug, price, categories, productName, images = null, productHeading = null) => {
  // Ensure categories is an array
  const categoryArray = Array.isArray(categories) ? categories : (categories ? [categories] : []);
  const categoriesYaml = categoryArray.length > 0
    ? `[${categoryArray.map(c => `"${c}"`).join(', ')}]`
    : '[]';

  // Use the actual H1 from content for header_text, fallback to product name or metadata
  const headerText = productHeading || productName || metadata.header_text || metadata.title || '';

  // Get product order, default to 50 if not in mapping
  const productOrder = PRODUCT_ORDER[slug] || 50;

  // Base frontmatter
  let frontmatter = `---
title: "${productName || metadata.title || ''}"
price: "${price}"
order: ${productOrder}
header_text: "${headerText}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/products/${slug}/"
categories: ${categoriesYaml}
features: []`;

  // Add header image only (no gallery)
  if (images && images.header_image) {
    frontmatter += `\nheader_image: "${images.header_image}"`;
  }

  frontmatter += '\n---';
  return frontmatter;
};

/**
 * Generate frontmatter for category content
 * @param {Object} metadata - Extracted metadata
 * @param {string} slug - Category slug
 * @param {string} categoryHeading - The H1 heading from category content
 * @param {number} categoryIndex - Zero-based index of this category
 * @returns {string} Frontmatter YAML
 */
const generateCategoryFrontmatter = (metadata, slug, categoryHeading = null, categoryIndex = 0) => {
  const config = require('../config');

  // Use the actual H1 from content for header_text, fallback to breadcrumb or title
  const headerText = categoryHeading || metadata.header_text || metadata.title || '';

  let frontmatter = `---
title: "${metadata.title || ''}"
header_text: "${headerText}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/categories/${slug}/"
featured: false`;

  // Add navigation if categoriesInNavigation option is enabled
  if (config.options.categoriesInNavigation) {
    const navOrder = 20 + categoryIndex;
    frontmatter += `
eleventyNavigation:
  key: ${metadata.title || headerText}
  order: ${navOrder}`;
  }

  frontmatter += '\n---';
  return frontmatter;
};

/**
 * Generate frontmatter for review content
 * @param {string} name - Reviewer name
 * @param {string} productSlug - Product slug to link to
 * @returns {string} Frontmatter YAML
 */
const generateReviewFrontmatter = (name, productSlug) => {
  return `---
name: "${name}"
products: ["products/${productSlug}.md"]
---`;
};

module.exports = {
  generatePageFrontmatter,
  generateBlogFrontmatter,
  generateProductFrontmatter,
  generateCategoryFrontmatter,
  generateReviewFrontmatter
};