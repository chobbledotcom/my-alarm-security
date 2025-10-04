const fs = require('fs');
const path = require('path');
const https = require('https');

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
 * Download a file from URL
 * @param {string} url - URL to download from
 * @param {string} filepath - Local path to save file
 * @returns {Promise<void>}
 */
const downloadFile = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const writeStream = fs.createWriteStream(filepath);
        response.pipe(writeStream);
        writeStream.on('finish', () => {
          writeStream.close();
          resolve();
        });
        writeStream.on('error', reject);
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
};

module.exports = {
  ensureDir,
  readHtmlFile,
  writeMarkdownFile,
  listHtmlFiles,
  downloadFile
};