/**
 * Reusable regex patterns for HTML extraction
 * Provides consistent patterns and extraction helpers
 */

const patterns = {
  title: /<title[^>]*>(.*?)<\/title>/i,
  metaTag: (name) => new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["'](.*?)["']`, 'i'),
  metaProperty: (prop) => new RegExp(`<meta\\s+property=["']${prop}["']\\s+content=["'](.*?)["']`, 'i'),
  linkRel: (rel) => new RegExp(`<link\\s+rel=["']${rel}["']\\s+href=["'](.*?)["']`, 'i')
};

/**
 * Extract content using a pattern
 * @param {string} html - HTML content
 * @param {RegExp} pattern - Regex pattern
 * @param {number} group - Capture group index (default 1)
 * @returns {string} Extracted content or empty string
 */
const extract = (html, pattern, group = 1) => {
  const match = html.match(pattern);
  return match ? match[group].trim() : '';
};

module.exports = {
  patterns,
  extract
};
