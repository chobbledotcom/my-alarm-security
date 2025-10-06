const path = require('path');
const config = require('../config');
const { ensureDir, readHtmlFile, writeMarkdownFile, listHtmlFiles, cleanDirectory } = require('../utils/filesystem');
const { extractMetadata, extractBlogDate } = require('../utils/metadata-extractor');
const { convertToMarkdown } = require('../utils/pandoc-converter');
const { processContent } = require('../utils/content-processor');
const { generateBlogFrontmatter } = require('../utils/frontmatter-generator');

/**
 * Convert a single blog post HTML file to markdown
 * @param {string} file - HTML filename
 * @param {string} inputDir - Input directory path
 * @param {string} outputDir - Output directory path
 * @returns {boolean} Success status
 */
const convertBlogPost = (file, inputDir, outputDir) => {
  try {
    const htmlPath = path.join(inputDir, file);
    const htmlContent = readHtmlFile(htmlPath);
    const metadata = extractMetadata(htmlContent);
    const markdown = convertToMarkdown(htmlPath);
    const date = extractBlogDate(markdown, config.DEFAULT_DATE);
    const content = processContent(markdown, 'blog');

    const slug = file.replace('.php.html', '');
    const filename = `${date}-${slug}.md`;

    const frontmatter = generateBlogFrontmatter(metadata, slug, date);
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
 * Convert all blog posts from old site to markdown
 * @returns {Object} Conversion results
 */
const convertBlogPosts = () => {
  console.log('Converting blog posts to news...');

  const outputDir = path.join(config.OUTPUT_BASE, config.paths.news);
  ensureDir(outputDir);
  cleanDirectory(outputDir);

  const blogDir = path.join(config.OLD_SITE_PATH, config.paths.blog);
  const files = listHtmlFiles(blogDir);

  let successful = 0;
  let failed = 0;

  files.forEach(file => {
    if (convertBlogPost(file, blogDir, outputDir)) {
      successful++;
    } else {
      failed++;
    }
  });

  return { successful, failed, total: files.length };
};

module.exports = {
  convertBlogPost,
  convertBlogPosts
};