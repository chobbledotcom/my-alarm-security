#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONTENT_DIRS = ['pages', 'news', 'products', 'categories'];

// Clean up markdown content
const cleanMarkdown = (content) => {
  return content
    // Remove pandoc div containers
    .replace(/:::\s*\{[^}]*\}\s*:::/g, '')
    .replace(/:::\s*$/gm, '')
    .replace(/^:::\s*/gm, '')

    // Remove attribute blocks from links and images
    .replace(/\{[^}]*\}/g, '')

    // Fix escaped quotes
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')

    // Remove redundant headers that duplicate the title
    .replace(/^#+\s*\[.*?\]\s*$/gm, '')
    .replace(/^#+\s*\*\*.*?\*\*\s*$/gm, '')

    // Clean up excessive whitespace
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')

    // Fix links to use proper paths
    .replace(/\.\.\//g, '/')
    .replace(/\.php\.html/g, '')

    // Remove empty paragraphs
    .replace(/^\s*\\?\s*$/gm, '')

    // Clean up line breaks
    .replace(/\\\s*$/gm, '')

    .trim();
};

// Process each content directory
CONTENT_DIRS.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory ${dir} does not exist, skipping...`);
    return;
  }

  console.log(`Cleaning up ${dir}...`);

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Split frontmatter and content
    const parts = content.split('---');
    if (parts.length >= 3) {
      const frontmatter = parts[1];
      const body = parts.slice(2).join('---');
      const cleanedBody = cleanMarkdown(body);

      const newContent = `---${frontmatter}---\n\n${cleanedBody}`;
      fs.writeFileSync(filePath, newContent);
      console.log(`  Cleaned: ${file}`);
    }
  });
});

console.log('Cleanup completed!');