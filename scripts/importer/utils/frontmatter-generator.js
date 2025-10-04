/**
 * Generate frontmatter for page content
 * @param {Object} metadata - Extracted metadata
 * @param {string} slug - Page slug
 * @returns {string} Frontmatter YAML
 */
const generatePageFrontmatter = (metadata, slug) => {
  // Define pages that should appear in navigation
  const navPages = {
    'about-us': { key: 'About', order: 2 },
    'contact': { key: 'Contact', order: 5 }
  };

  let frontmatter = `---
header_text: "${metadata.header_text || metadata.title || ''}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/pages/${slug}/"
layout: page`;

  // Add navigation if this page should be in nav
  if (navPages[slug]) {
    frontmatter += `
eleventyNavigation:
  key: ${navPages[slug].key}
  order: ${navPages[slug].order}`;
  }

  frontmatter += '\n---';
  return frontmatter;
};

/**
 * Generate frontmatter for blog/news content
 * @param {Object} metadata - Extracted metadata
 * @param {string} slug - Post slug
 * @param {string} date - Post date
 * @returns {string} Frontmatter YAML
 */
const generateBlogFrontmatter = (metadata, slug, date) => {
  return `---
title: "${metadata.title || slug.replace(/-/g, ' ')}"
date: ${date}
header_text: "${metadata.header_text || metadata.title || ''}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/news/${slug}/"
---`;
};

/**
 * Generate frontmatter for product content
 * @param {Object} metadata - Extracted metadata
 * @param {string} slug - Product slug
 * @param {string} price - Product price
 * @param {string} category - Product category
 * @param {Object} images - Product images with local paths
 * @returns {string} Frontmatter YAML
 */
const generateProductFrontmatter = (metadata, slug, price, category, images = null) => {
  const title = metadata.title || '';

  // Base frontmatter
  let frontmatter = `---
title: "${title}"
price: "${price}"
header_text: "${metadata.header_text || title}"
meta_title: "${title}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/products/${slug}/"
categories: ${category ? `["${category}"]` : '[]'}
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
 * @returns {string} Frontmatter YAML
 */
const generateCategoryFrontmatter = (metadata, slug) => {
  return `---
title: "${metadata.title || ''}"
header_text: "${metadata.header_text || metadata.title || ''}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/categories/${slug}/"
featured: false
---`;
};

module.exports = {
  generatePageFrontmatter,
  generateBlogFrontmatter,
  generateProductFrontmatter,
  generateCategoryFrontmatter
};