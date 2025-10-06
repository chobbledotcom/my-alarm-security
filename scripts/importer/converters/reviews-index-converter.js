const path = require('path');
const config = require('../config');
const { ensureDir, readHtmlFile, writeMarkdownFile } = require('../utils/filesystem');
const { extractMetadata } = require('../utils/metadata-extractor');
const { convertToMarkdown } = require('../utils/pandoc-converter');
const { processContent } = require('../utils/content-processor');
const { generatePageFrontmatter } = require('../utils/frontmatter-generator');

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

    // Extract only the intro text before "Click Here To Leave A Review!"
    const clickHerePattern = /\[Click Here To Leave A Review!\]/i;
    const introContent = content.split(clickHerePattern)[0].trim();

    const frontmatter = generatePageFrontmatter(metadata, 'reviews');
    const fullContent = `${frontmatter}\n\n${introContent}`;
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
