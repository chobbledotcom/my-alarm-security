const path = require('path');
const config = require('../config');
const { ensureDir, listHtmlFiles } = require('../utils/filesystem');
const { generatePageFrontmatter } = require('../utils/frontmatter-generator');
const { downloadEmbeddedImages } = require('../utils/image-downloader');
const { createConverter } = require('../utils/base-converter');
const fs = require('fs');

const { convertSingle, convertBatch } = createConverter({
  contentType: 'page',
  extractors: {},
  frontmatterGenerator: (metadata, slug) => generatePageFrontmatter(metadata, slug),
  beforeWrite: async (content, extracted, slug) =>
    await downloadEmbeddedImages(content, 'pages', slug)
});

/**
 * Convert all pages from old site to markdown
 * @returns {Promise<Object>} Conversion results
 */
const convertPages = async () => {
  console.log('Converting pages...');

  const outputDir = path.join(config.OUTPUT_BASE, config.paths.pages);
  ensureDir(outputDir);

  const pagesDir = path.join(config.OLD_SITE_PATH, 'pages');
  const pageFiles = listHtmlFiles(pagesDir);

  // Convert root-level pages (contact only - reviews handled by reviews-index-converter)
  const rootPages = ['contact.php.html'].filter(file =>
    fs.existsSync(path.join(config.OLD_SITE_PATH, file))
  );

  const pagesResult = await convertBatch(pageFiles, pagesDir, outputDir);
  const rootResult = await convertBatch(rootPages, config.OLD_SITE_PATH, outputDir);

  return {
    successful: pagesResult.successful + rootResult.successful,
    failed: pagesResult.failed + rootResult.failed,
    total: pagesResult.total + rootResult.total
  };
};

const convertPage = (file, inputDir, outputDir) =>
  convertSingle(file, inputDir, outputDir);

module.exports = {
  convertPage,
  convertPages
};
