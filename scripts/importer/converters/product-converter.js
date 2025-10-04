const path = require('path');
const config = require('../config');
const { ensureDir, readHtmlFile, writeMarkdownFile, listHtmlFiles } = require('../utils/filesystem');
const { extractMetadata, extractPrice, extractCategory, extractProductName } = require('../utils/metadata-extractor');
const { convertToMarkdown } = require('../utils/pandoc-converter');
const { processContent } = require('../utils/content-processor');
const { generateProductFrontmatter } = require('../utils/frontmatter-generator');

/**
 * Convert a single product HTML file to markdown
 * @param {string} file - HTML filename
 * @param {string} inputDir - Input directory path
 * @param {string} outputDir - Output directory path
 * @returns {boolean} Success status
 */
const convertProduct = (file, inputDir, outputDir) => {
  try {
    const htmlPath = path.join(inputDir, file);
    const htmlContent = readHtmlFile(htmlPath);
    const metadata = extractMetadata(htmlContent);
    const markdown = convertToMarkdown(htmlPath);
    const content = processContent(markdown, 'product');

    // Extract product-specific data
    const price = extractPrice(htmlContent);
    const category = extractCategory(htmlContent);
    const productName = extractProductName(htmlContent);

    const filename = file.replace('.php.html', '.md');
    const slug = filename.replace('.md', '');

    const frontmatter = generateProductFrontmatter(metadata, slug, price, category, productName);
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
  ensureDir(outputDir);

  const productsDir = path.join(config.OLD_SITE_PATH, config.paths.products);
  const files = listHtmlFiles(productsDir);

  if (files.length === 0) {
    console.log('  No products directory found, skipping...');
    return { successful: 0, failed: 0, total: 0 };
  }

  let successful = 0;
  let failed = 0;

  files.forEach(file => {
    if (convertProduct(file, productsDir, outputDir)) {
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