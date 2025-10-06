const path = require('path');
const config = require('../config');
const { ensureDir, readHtmlFile, writeMarkdownFile } = require('../utils/filesystem');
const { extractMetadata } = require('../utils/metadata-extractor');
const { convertToMarkdown } = require('../utils/pandoc-converter');
const { processContent } = require('../utils/content-processor');

/**
 * Convert blog index page from old site
 * @returns {Object} Conversion results
 */
const convertBlogIndex = () => {
  console.log('Converting blog index page...');

  const outputDir = path.join(config.OUTPUT_BASE, 'pages');
  ensureDir(outputDir);

  const blogPath = path.join(config.OLD_SITE_PATH, 'blog.php.html');

  try {
    const htmlContent = readHtmlFile(blogPath);
    const metadata = extractMetadata(htmlContent);
    const markdown = convertToMarkdown(blogPath);
    const content = processContent(markdown, 'page');

    const frontmatter = `---
header_text: "Latest Blog Posts"
meta_title: "Latest Blog Posts | MyAlarm Security"
meta_description: "All of the latest news from MyAlarm Security about home security, burglar alarms, and CCTV systems."
permalink: "/blog/"
layout: news
eleventyNavigation:
  key: News
  order: 5
---`;

    const fullContent = `${frontmatter}\n\n${content}`;
    const outputPath = path.join(outputDir, 'blog.md');

    writeMarkdownFile(outputPath, fullContent);
    console.log('  Converted: blog.md');
    return { successful: 1, failed: 0, total: 1 };
  } catch (error) {
    console.error('  Error converting blog index page:', error.message);
    return { successful: 0, failed: 1, total: 1 };
  }
};

module.exports = {
  convertBlogIndex
};
