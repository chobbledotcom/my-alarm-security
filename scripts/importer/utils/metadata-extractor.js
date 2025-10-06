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
 * Extract product name from JSON-LD schema or breadcrumb
 * @param {string} htmlContent - HTML content to extract product name from
 * @returns {string} Extracted product name
 */
const extractProductName = (htmlContent) => {
  // Try JSON-LD schema first
  const schemaMatch = htmlContent.match(/"@type":"Product","name":"([^"]+)"/i);
  if (schemaMatch) {
    return schemaMatch[1].replace(/&pound;/g, '£');
  }

  // Fallback to active breadcrumb
  const breadcrumbMatch = htmlContent.match(/<li class="breadcrumb-item active">([^<]+)<\/li>/i);
  if (breadcrumbMatch) {
    return breadcrumbMatch[1].replace(/&pound;/g, '£').trim();
  }

  return '';
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

/**
 * Extract reviews from product HTML
 * @param {string} htmlContent - HTML content to extract reviews from
 * @returns {Array<Object>} Array of review objects with name and body
 */
const extractReviews = (htmlContent) => {
  const reviews = [];
  const reviewTableMatch = htmlContent.match(/<div class="menu-heading[^>]*>Our Reviews!<\/div>[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/);

  if (!reviewTableMatch) {
    return reviews;
  }

  const tableContent = reviewTableMatch[1];
  const rowRegex = /<tr>\s*<td>[\s\S]*?<strong>([^<]+)<\/strong>[\s\S]*?<div class="diblock" itemprop="description">\s*([\s\S]*?)\s*<\/div>[\s\S]*?<\/td>\s*<\/tr>/g;

  let match;
  while ((match = rowRegex.exec(tableContent)) !== null) {
    const name = match[1].trim();
    const body = match[2].trim().replace(/\s+/g, ' ');

    if (name && body) {
      reviews.push({ name, body });
    }
  }

  return reviews;
};

/**
 * Extract product images from HTML content
 * @param {string} htmlContent - HTML content to extract images from
 * @returns {Object} Object with header_image and gallery array
 */
const extractProductImages = (htmlContent) => {
  const images = {
    header_image: '',
    gallery: []
  };

  // Extract og:image for header image
  const ogImageMatch = htmlContent.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
  if (ogImageMatch) {
    images.header_image = ogImageMatch[1];
    // Use header image as the single gallery image
    images.gallery.push(ogImageMatch[1]);
  }

  return images;
};

/**
 * Extract favicon links from HTML content
 * @param {string} htmlContent - HTML content to extract favicon links from
 * @returns {Array<Object>} Array of favicon link objects
 */
const extractFaviconLinks = (htmlContent) => {
  const faviconLinks = [];

  // Match all link tags that might be favicon-related
  const linkRegex = /<link\s+([^>]*?)>/gi;
  const links = htmlContent.matchAll(linkRegex);

  for (const linkMatch of links) {
    const linkTag = linkMatch[1];

    // Check if this is a favicon-related link
    const relMatch = linkTag.match(/rel=["']([^"']*?)["']/i);
    if (!relMatch) continue;

    const rel = relMatch[1].toLowerCase();
    const isFavicon = rel.includes('icon') || rel.includes('apple-touch');

    if (!isFavicon) continue;

    // Extract attributes
    const hrefMatch = linkTag.match(/href=["']([^"']*?)["']/i);
    const sizesMatch = linkTag.match(/sizes=["']([^"']*?)["']/i);
    const typeMatch = linkTag.match(/type=["']([^"']*?)["']/i);

    if (hrefMatch) {
      faviconLinks.push({
        rel,
        href: hrefMatch[1],
        sizes: sizesMatch ? sizesMatch[1] : null,
        type: typeMatch ? typeMatch[1] : null
      });
    }
  }

  return faviconLinks;
};

module.exports = {
  extractMetadata,
  extractPrice,
  extractCategory,
  extractCategoryName,
  extractProductName,
  extractBlogDate,
  extractReviews,
  extractProductImages,
  extractFaviconLinks
};