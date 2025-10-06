const path = require('path');
const config = require('../config');
const { ensureDir, readHtmlFile, writeMarkdownFile } = require('../utils/filesystem');
const { extractMetadata } = require('../utils/metadata-extractor');
const { convertToMarkdown } = require('../utils/pandoc-converter');
const { processContent } = require('../utils/content-processor');

/**
 * Convert reviews page from old site
 * @returns {Object} Conversion results
 */
const convertReviewsIndex = () => {
  console.log('Converting reviews page...');

  const outputDir = path.join(config.OUTPUT_BASE, 'pages');
  ensureDir(outputDir);

  const reviewsPath = path.join(config.OLD_SITE_PATH, 'reviews.php.html');

  try {
    const htmlContent = readHtmlFile(reviewsPath);
    const metadata = extractMetadata(htmlContent);
    const markdown = convertToMarkdown(reviewsPath);
    const content = processContent(markdown, 'page');

    const frontmatter = `---
header_text: "Reviews"
meta_title: "Reviews"
meta_description: "Reviews"
permalink: "/pages/reviews/"
layout: page
eleventyNavigation:
  key: Reviews
  order: 4
---`;

    const fullContent = `${frontmatter}\n\n${content}`;
    const outputPath = path.join(outputDir, 'reviews.md');

    writeMarkdownFile(outputPath, fullContent);
    console.log('  Converted: reviews.md');
    return { successful: 1, failed: 0, total: 1 };
  } catch (error) {
    console.error('  Error converting reviews page:', error.message);
    return { successful: 0, failed: 1, total: 1 };
  }
};

module.exports = {
  convertReviewsIndex
};
