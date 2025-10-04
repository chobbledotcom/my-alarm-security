const path = require('path');
const config = require('../config');
const { ensureDir, readHtmlFile, writeMarkdownFile, listHtmlFiles } = require('../utils/filesystem');
const { extractMetadata, extractPrice, extractCategory, extractReviews } = require('../utils/metadata-extractor');
const { convertToMarkdown } = require('../utils/pandoc-converter');
const { processContent } = require('../utils/content-processor');
const { generateProductFrontmatter, generateReviewFrontmatter } = require('../utils/frontmatter-generator');

/**
 * Convert a single product HTML file to markdown
 * @param {string} file - HTML filename
 * @param {string} inputDir - Input directory path
 * @param {string} outputDir - Output directory path
 * @param {string} reviewsDir - Reviews output directory path
 * @returns {boolean} Success status
 */
const convertProduct = (file, inputDir, outputDir, reviewsDir) => {
  try {
    const htmlPath = path.join(inputDir, file);
    const htmlContent = readHtmlFile(htmlPath);
    const metadata = extractMetadata(htmlContent);
    const markdown = convertToMarkdown(htmlPath);
    const content = processContent(markdown, 'product');

    // Extract product-specific data
    const price = extractPrice(htmlContent);
    const category = extractCategory(htmlContent);
    const reviews = extractReviews(htmlContent);

    const filename = file.replace('.php.html', '.md');
    const slug = filename.replace('.md', '');

    // Create review files for this product
    if (reviews.length > 0) {
      reviews.forEach((review, index) => {
        const reviewSlug = `${slug}-review-${index + 1}`;
        const reviewFilename = `${reviewSlug}.md`;
        const reviewFrontmatter = generateReviewFrontmatter(review.name, slug);
        const reviewContent = `${reviewFrontmatter}\n\n${review.body}`;

        writeMarkdownFile(path.join(reviewsDir, reviewFilename), reviewContent);
      });
      console.log(`  Created ${reviews.length} review(s) for ${filename}`);
    }

    const frontmatter = generateProductFrontmatter(metadata, slug, price, category);
    const fullContent = `${frontmatter}\n\n${content}`;

    writeMarkdownFile(path.join(outputDir, filename), fullContent);
    console.log(`  Converted: ${filename}`);
    return true;
  } catch (error) {
    console.error(`  Error converting ${file}:`, error.message);
    return false;
  }
};

/**
 * Convert all products from old site to markdown
 * @returns {Object} Conversion results
 */
const convertProducts = () => {
  console.log('Converting products...');

  const outputDir = path.join(config.OUTPUT_BASE, config.paths.products);
  const reviewsDir = path.join(config.OUTPUT_BASE, 'reviews');
  ensureDir(outputDir);
  ensureDir(reviewsDir);

  const productsDir = path.join(config.OLD_SITE_PATH, config.paths.products);
  const files = listHtmlFiles(productsDir);

  if (files.length === 0) {
    console.log('  No products directory found, skipping...');
    return { successful: 0, failed: 0, total: 0 };
  }

  let successful = 0;
  let failed = 0;

  files.forEach(file => {
    if (convertProduct(file, productsDir, outputDir, reviewsDir)) {
      successful++;
    } else {
      failed++;
    }
  });

  return { successful, failed, total: files.length };
};

module.exports = {
  convertProduct,
  convertProducts
};