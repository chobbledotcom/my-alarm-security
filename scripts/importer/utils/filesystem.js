const fs = require('fs');
const path = require('path');

/**
 * Ensure a directory exists, creating it if necessary
 * @param {string} dir - Directory path to ensure exists
 */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Read HTML file content
 * @param {string} filePath - Path to HTML file
 * @returns {string} HTML content
 */
const readHtmlFile = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

/**
 * Write markdown file
 * @param {string} filePath - Path to output file
 * @param {string} content - Content to write
 */
const writeMarkdownFile = (filePath, content) => {
  fs.writeFileSync(filePath, content);
};

/**
 * List HTML files in a directory
 * @param {string} dir - Directory to list files from
 * @returns {string[]} Array of HTML filenames
 */
const listHtmlFiles = (dir) => {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir).filter(f => f.endsWith('.html'));
};

/**
 * Clean all files from a directory
 * @param {string} dir - Directory to clean
 */
const cleanDirectory = (dir) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
  }
};

module.exports = {
  ensureDir,
  readHtmlFile,
  writeMarkdownFile,
  listHtmlFiles,
  cleanDirectory
};