const path = require('path');
const config = require('../config');
const { ensureDir, writeMarkdownFile } = require('../utils/filesystem');

/**
 * Generate news index page with navigation
 * @returns {Object} Conversion results
 */
const convertNewsIndex = () => {
  console.log('Creating news index page...');

  const outputDir = path.join(config.OUTPUT_BASE, 'pages');
  ensureDir(outputDir);

  const frontmatter = `---
header_text: "Security News & Updates"
meta_title: "Security News & Updates | MyAlarm Security"
meta_description: "Latest news, tips, and updates from MyAlarm Security about home security, burglar alarms, and CCTV systems."
permalink: "/news/"
layout: news
eleventyNavigation:
  key: News
  order: 5
---`;

  const content = `# Security News & Updates

Stay up to date with the latest news, tips, and updates from MyAlarm Security.

Browse our collection of articles about home security, burglar alarms, CCTV systems, and industry updates.`;

  const fullContent = `${frontmatter}\n\n${content}`;
  const outputPath = path.join(outputDir, 'news.md');

  try {
    writeMarkdownFile(outputPath, fullContent);
    console.log('  Created: news.md');
    return { successful: 1, failed: 0, total: 1 };
  } catch (error) {
    console.error('  Error creating news.md:', error.message);
    return { successful: 0, failed: 1, total: 1 };
  }
};

module.exports = {
  convertNewsIndex
};
