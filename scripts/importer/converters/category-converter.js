const path = require('path');
const config = require('../config');
const { ensureDir, readHtmlFile, writeMarkdownFile, listHtmlFiles, downloadEmbeddedImages } = require('../utils/filesystem');
const { extractMetadata, extractCategoryName } = require('../utils/metadata-extractor');
const { convertToMarkdown } = require('../utils/pandoc-converter');
const { processContent } = require('../utils/content-processor');
const { generateCategoryFrontmatter } = require('../utils/frontmatter-generator');

/**
 * Convert a single category HTML file to markdown
 * @param {string} file - HTML filename
 * @param {string} inputDir - Input directory path
 * @param {string} outputDir - Output directory path
 * @returns {Promise<boolean>} Success status
 */
const convertCategory = async (file, inputDir, outputDir) => {
  try {
    const htmlPath = path.join(inputDir, file);
    const htmlContent = readHtmlFile(htmlPath);
    const metadata = extractMetadata(htmlContent);
    const categoryName = extractCategoryName(htmlContent);

    // Use category name from breadcrumb if available, otherwise fall back to title
    if (categoryName) {
      metadata.title = categoryName;
    }

    const markdown = convertToMarkdown(htmlPath);
    const content = processContent(markdown, 'category');

    const filename = file.replace('.php.html', '.md');
    const slug = filename.replace('.md', '');

    const contentWithLocalImages = await downloadEmbeddedImages(content, 'categories', slug);

    const frontmatter = generateCategoryFrontmatter(metadata, slug);
    const fullContent = `${frontmatter}\n\n${contentWithLocalImages}`;

    writeMarkdownFile(path.join(outputDir, filename), fullContent);
    console.log(`  Converted: ${filename}`);
    return true;
  } catch (error) {
    console.error(`  Error converting ${file}:`, error.message);
    return false;
  }
};

/**
 * Convert all categories from old site to markdown
 * @returns {Promise<Object>} Conversion results
 */
const convertCategories = async () => {
  console.log('Converting categories...');

  const outputDir = path.join(config.OUTPUT_BASE, config.paths.categories);
  ensureDir(outputDir);

  const categoriesDir = path.join(config.OLD_SITE_PATH, config.paths.categories);
  const files = listHtmlFiles(categoriesDir);

  if (files.length === 0) {
    console.log('  No categories directory found, skipping...');
    return { successful: 0, failed: 0, total: 0 };
  }

  let successful = 0;
  let failed = 0;

  for (const file of files) {
    if (await convertCategory(file, categoriesDir, outputDir)) {
      successful++;
    } else {
      failed++;
    }
  }

  return { successful, failed, total: files.length };
};

module.exports = {
  convertCategory,
  convertCategories
};