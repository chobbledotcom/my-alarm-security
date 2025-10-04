/**
 * Extract main content from markdown (remove nav, footer, etc.)
 * @param {string} markdown - Raw markdown content
 * @param {string} contentType - Type of content (blog, page, product, category)
 * @returns {string} Extracted main content
 */
const extractMainContent = (markdown, contentType) => {
  const lines = markdown.split('\n');
  let content = [];
  let inMainContent = false;
  let skipNext = false;
  let inReviewSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip navigation and header elements
    if (line.includes('navbar') || line.includes('drawer') || line.includes('breadcrumb')) {
      skipNext = true;
      continue;
    }

    // Skip forms (contact forms should be handled by layout)
    if (line.includes('**Name:') || line.includes('**Phone:') || line.includes('**Email:') ||
        line.includes('**Product Enquiry:') || line.includes('**Your Postcode:') ||
        line.includes('**Message:') || line.includes('**Captcha:')) {
      break;
    }

    // Detect start of review section and skip until we hit "Our Prices!" or new heading
    if (line.includes('Our Reviews!')) {
      inReviewSection = true;
      continue;
    }

    // Exit review section when we hit "Our Prices!" or a main heading
    if (inReviewSection && (line.includes('Our Prices!') || line.match(/^# [A-Z]/))) {
      inReviewSection = false;
      // Don't skip "Our Prices!" - we want to keep it
    }

    // Skip content while in review section
    if (inReviewSection) {
      continue;
    }

    // Skip footer content
    if (line.includes('footer') || line.includes('widget_section')) {
      break;
    }

    // Look for main content indicators based on content type
    if (contentType === 'blog' && (line.includes('# ') || line.includes('Posted By:'))) {
      inMainContent = true;
    } else if ((contentType === 'page' || contentType === 'product' || contentType === 'category') && line.includes('# ')) {
      inMainContent = true;
    }

    if (inMainContent && !skipNext) {
      content.push(line);
    }

    skipNext = false;
  }

  return content.join('\n').trim();
};

/**
 * Clean up content by removing unwanted markdown artifacts
 * @param {string} content - Content to clean
 * @returns {string} Cleaned content
 */
const cleanContent = (content) => {
  return content
    .replace(/Posted By:.*?\n/g, '') // Remove blog post metadata
    .replace(/^:::\s*.*$/gm, '') // Remove all pandoc div markers
    .replace(/\[[^\]]+\]\{style="[^"]*"\}/g, (match) => {
      // Extract text from [text]{style="..."} patterns
      const textMatch = match.match(/\[([^\]]+)\]/);
      return textMatch ? textMatch[1] : match;
    })
    .replace(/\{style="[^"]*"\}/g, '') // Remove remaining style attributes
    .replace(/\{[^}]*\}/g, '') // Remove remaining attribute blocks
    .replace(/\[ \]/g, '') // Remove empty checkbox markers from ql-cursor spans
    .replace(/\[([^\[\]]*?)\](?!\()/g, '$1') // Remove square brackets not part of links
    .replace(/^\[([^\]]+)\]\s*$/gm, '$1') // Remove square brackets around standalone lines
    .replace(/^(#+)\s*\[([^\]]+)\]\s*$/gm, '$1 $2') // Fix headers with square brackets
    .replace(/\[{2,}/g, '[') // Fix multiple opening brackets
    .replace(/\]{2,}/g, ']') // Fix multiple closing brackets
    .replace(/\*{3,}/g, '**') // Fix multiple asterisks
    .replace(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*\]/g, '**[$1]($2)**') // Fix **[link](url)**]
    .replace(/\]\*\*\s*$/gm, '**') // Fix trailing ]** at end of line
    .replace(/\)\*\*\]\s*$/gm, ')**') // Fix trailing )**] at end of line
    .replace(/\\\s*$/gm, '') // Remove trailing backslashes
    .replace(/\(\.\.\/([^)]+)\.php\.html\)/g, '(/$1.php)') // Fix relative links: ../pages/foo.php.html -> /pages/foo.php
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize whitespace
    .trim();
};

/**
 * Process raw markdown to extract and clean content
 * @param {string} markdown - Raw markdown from pandoc
 * @param {string} contentType - Type of content
 * @returns {string} Processed and cleaned content
 */
const processContent = (markdown, contentType) => {
  const extracted = extractMainContent(markdown, contentType);
  return cleanContent(extracted);
};

module.exports = {
  extractMainContent,
  cleanContent,
  processContent
};