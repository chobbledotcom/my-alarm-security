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

/**
 * Generate a unique filename from URL
 * @param {string} url - Image URL
 * @param {string} contentType - Type of content (page, category, product)
 * @param {string} slug - Content slug
 * @returns {string} Unique filename
 */
const generateImageFilename = (url, contentType, slug) => {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  const cloudinaryId = pathParts[pathParts.length - 1].split('.')[0];
  const extension = pathParts[pathParts.length - 1].split('.').pop() || 'webp';
  return `${contentType}-${slug}-${cloudinaryId}.${extension}`;
};

/**
 * Remove Cloudinary transformation parameters to get original source URL
 * @param {string} url - Cloudinary URL with transformations
 * @returns {string} URL without f_auto,q_auto transformations
 */
const removeCloudinaryTransformations = (url) => {
  return url.replace(/\/f_auto,q_auto\//g, '/');
};

/**
 * Download embedded images from content and update URLs
 * @param {string} content - Content with image URLs
 * @param {string} contentType - Type of content (page, category, product)
 * @param {string} slug - Content slug
 * @returns {Promise<string>} Content with updated local image paths
 */
const downloadEmbeddedImages = async (content, contentType, slug) => {
  const imagesDir = path.join(__dirname, '..', '..', '..', 'images', contentType);
  ensureDir(imagesDir);

  const imageRegex = /!\[([^\]]*)\]\((https:\/\/res\.cloudinary\.com\/[^)]+)\)/g;
  const matches = [...content.matchAll(imageRegex)];

  let updatedContent = content;

  for (const match of matches) {
    const altText = match[1];
    const imageUrl = match[2];
    const sourceUrl = removeCloudinaryTransformations(imageUrl);
    const filename = generateImageFilename(sourceUrl, contentType, slug);
    const localPath = path.join(imagesDir, filename);
    const webPath = `/images/${contentType}/${filename}`;

    try {
      await downloadFile(sourceUrl, localPath);
      updatedContent = updatedContent.replace(
        `![${altText}](${imageUrl})`,
        `![${altText}](${webPath})`
      );
    } catch (error) {
      console.error(`    Warning: Failed to download ${sourceUrl}:`, error.message);
    }
  }

  return updatedContent;
};

module.exports = {
  ensureDir,
  readHtmlFile,
  writeMarkdownFile,
  listHtmlFiles,
  cleanDirectory,
  downloadFile,
  downloadEmbeddedImages
};