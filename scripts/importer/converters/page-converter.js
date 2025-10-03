const path = require('path');
const config = require('../config');
const { ensureDir, readHtmlFile, writeMarkdownFile, listHtmlFiles } = require('../utils/filesystem');
const { extractMetadata } = require('../utils/metadata-extractor');
const { convertToMarkdown } = require('../utils/pandoc-converter');
const { processContent } = require('../utils/content-processor');
const { generatePageFrontmatter } = require('../utils/frontmatter-generator');

/**
 * Convert a single page HTML file to markdown
 * @param {string} file - HTML filename
 * @param {string} inputDir - Input directory path
 * @param {string} outputDir - Output directory path
 * @returns {boolean} Success status
 */
const convertPage = (file, inputDir, outputDir) => {
  try {
    const htmlPath = path.join(inputDir, file);
    const htmlContent = readHtmlFile(htmlPath);
    const metadata = extractMetadata(htmlContent);
    const markdown = convertToMarkdown(htmlPath);
    const content = processContent(markdown, 'page');

    const filename = file.replace('.php.html', '.md');
    const slug = filename.replace('.md', '');

    const frontmatter = generatePageFrontmatter(metadata, slug);
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
 * Convert all pages from old site to markdown
 * @returns {Object} Conversion results
 */
const convertPages = () => {
  console.log('Converting pages...');

  const outputDir = path.join(config.OUTPUT_BASE, config.paths.pages);
  ensureDir(outputDir);

  const pagesDir = path.join(config.OLD_SITE_PATH, 'pages');
  const files = listHtmlFiles(pagesDir);

  let successful = 0;
  let failed = 0;

  files.forEach(file => {
    if (convertPage(file, pagesDir, outputDir)) {
      successful++;
    } else {
      failed++;
    }
  });

  return { successful, failed, total: files.length };
};

module.exports = {
  convertPage,
  convertPages
};