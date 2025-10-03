/**
 * Generate frontmatter for page content
 * @param {Object} metadata - Extracted metadata
 * @param {string} slug - Page slug
 * @returns {string} Frontmatter YAML
 */
const generatePageFrontmatter = (metadata, slug) => {
  return `---
header_text: "${metadata.header_text || metadata.title || ''}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/pages/${slug}/"
layout: page
---`;
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
 * @returns {string} Frontmatter YAML
 */
const generateProductFrontmatter = (metadata, slug, price, category) => {
  return `---
title: "${metadata.title || ''}"
price: "${price}"
header_text: "${metadata.header_text || metadata.title || ''}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/products/${slug}/"
categories: ${category ? `["${category}"]` : '[]'}
features: []
---`;
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