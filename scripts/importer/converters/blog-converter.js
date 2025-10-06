const path = require('path');
const config = require('../config');
const { ensureDir, listHtmlFiles, cleanDirectory } = require('../utils/filesystem');
const { extractBlogDate } = require('../utils/metadata-extractor');
const { generateBlogFrontmatter } = require('../utils/frontmatter-generator');
const { createConverter } = require('../utils/base-converter');

const { convertSingle, convertBatch } = createConverter({
  contentType: 'blog',
  extractors: {
    date: (htmlContent, markdown) => extractBlogDate(markdown, config.DEFAULT_DATE)
  },
  frontmatterGenerator: (metadata, slug, extracted) => ({
    frontmatter: generateBlogFrontmatter(metadata, slug, extracted.date),
    filename: `${extracted.date}-${slug}.md`
  })
});

/**
 * Convert all blog posts from old site to markdown
 * @returns {Promise<Object>} Conversion results
 */
const convertBlogPosts = async () => {
  console.log('Converting blog posts to news...');

  const outputDir = path.join(config.OUTPUT_BASE, config.paths.news);
  ensureDir(outputDir);
  cleanDirectory(outputDir);

  const blogDir = path.join(config.OLD_SITE_PATH, config.paths.blog);
  const files = listHtmlFiles(blogDir);

  return await convertBatch(files, blogDir, outputDir);
};

const convertBlogPost = (file, inputDir, outputDir) =>
  convertSingle(file, inputDir, outputDir);

module.exports = {
  convertBlogPost,
  convertBlogPosts
};
