const path = require('path');
const config = require('../config');
const { listHtmlFiles, prepDir } = require('../utils/filesystem');
const { extractCategoryName } = require('../utils/metadata-extractor');
const { generateCategoryFrontmatter } = require('../utils/frontmatter-generator');
const { downloadEmbeddedImages } = require('../utils/image-downloader');
const { createConverter } = require('../utils/base-converter');

const { convertSingle, convertBatch } = createConverter({
  contentType: 'category',
  extractors: {
    categoryName: (htmlContent) => extractCategoryName(htmlContent)
  },
  frontmatterGenerator: (metadata, slug, extracted) => {
    if (extracted.categoryName) {
      metadata.title = extracted.categoryName;
    }
    return generateCategoryFrontmatter(metadata, slug);
  },
  beforeWrite: async (content, extracted, slug) =>
    await downloadEmbeddedImages(content, 'categories', slug)
});

/**
 * Convert all categories from old site to markdown
 * @returns {Promise<Object>} Conversion results
 */
const convertCategories = async () => {
  console.log('Converting categories...');

  const outputDir = path.join(config.OUTPUT_BASE, config.paths.categories);
  const categoriesDir = path.join(config.OLD_SITE_PATH, config.paths.categories);
  const files = listHtmlFiles(categoriesDir);

  // Categories directory only contains imported categories, safe to clean all
  prepDir(outputDir);

  if (files.length === 0) {
    console.log('  No categories directory found, skipping...');
    return { successful: 0, failed: 0, total: 0 };
  }

  return await convertBatch(files, categoriesDir, outputDir);
};

const convertCategory = (file, inputDir, outputDir) =>
  convertSingle(file, inputDir, outputDir);

module.exports = {
  convertCategory,
  convertCategories
};
