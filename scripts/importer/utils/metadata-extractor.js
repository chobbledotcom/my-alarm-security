/**
 * Extract metadata from HTML content using regex patterns
 * @param {string} htmlContent - HTML content to extract metadata from
 * @returns {Object} Extracted metadata
 */
const extractMetadata = (htmlContent) => {
  const metadata = {};

  // Extract title
  const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    metadata.title = titleMatch[1].replace(/\s*-\s*My Alarm Security\s*$/, '').trim();
  }

  // Extract meta description
  const descMatch = htmlContent.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  if (descMatch) {
    metadata.meta_description = descMatch[1];
  }

  // Extract canonical URL for permalink
  const canonicalMatch = htmlContent.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
  if (canonicalMatch) {
    const url = canonicalMatch[1];
    const urlPath = url.replace(/^.*?\/([^\/]+\.php).*$/, '$1').replace('.php', '');
    metadata.permalink = `/${urlPath}/`;
  }

  // Extract og:title for header text
  const ogTitleMatch = htmlContent.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
  if (ogTitleMatch) {
    metadata.header_text = ogTitleMatch[1];
  }

  return metadata;
};

/**
 * Extract price from HTML content
 * @param {string} htmlContent - HTML content to extract price from
 * @returns {string} Extracted price with currency symbol
 */
const extractPrice = (htmlContent) => {
  // Try to extract from price table
  const priceTableMatch = htmlContent.match(/Our Price:<\/th>\s*<td[^>]*>\s*&pound;([\d,]+\.?\d*)/i);
  if (priceTableMatch) {
    return `£${priceTableMatch[1]}`;
  }

  // Fallback: look for price in JSON-LD schema
  const schemaMatch = htmlContent.match(/"price":"([\d,]+\.?\d*)"/i);
  if (schemaMatch) {
    return `£${schemaMatch[1]}`;
  }

  return '';
};

/**
 * Extract category from breadcrumbs
 * @param {string} htmlContent - HTML content to extract category from
 * @returns {string} Extracted category
 */
const extractCategory = (htmlContent) => {
  const breadcrumbMatch = htmlContent.match(/<li class="breadcrumb-item"><a href="\.\.\/categories\/([^"]+)\.php\.html">/i);
  return breadcrumbMatch ? breadcrumbMatch[1] : '';
};

/**
 * Extract category name from active breadcrumb
 * @param {string} htmlContent - HTML content to extract category name from
 * @returns {string} Extracted category name
 */
const extractCategoryName = (htmlContent) => {
  const match = htmlContent.match(/<li class="breadcrumb-item active">([^<]+)<\/li>/i);
  return match ? match[1].trim() : '';
};

/**
 * Extract blog post date from content
 * @param {string} content - Markdown content to extract date from
 * @param {string} defaultDate - Default date to use if none found
 * @returns {string} Date in YYYY-MM-DD format
 */
const extractBlogDate = (content, defaultDate = '2020-01-01') => {
  const dateMatch = content.match(/Posted Date:\s*(.*?)(?:\n|$)/);
  if (dateMatch) {
    try {
      return new Date(dateMatch[1]).toISOString().split('T')[0];
    } catch {
      return defaultDate;
    }
  }
  return defaultDate;
};

module.exports = {
  extractMetadata,
  extractPrice,
  extractCategory,
  extractCategoryName,
  extractBlogDate
};