const fs = require('fs');
const path = require('path');
const https = require('https');
const { ensureDir } = require('./filesystem');

/**
 * Remove Cloudinary transformation parameters to get original source URL
 * @param {string} url - Cloudinary URL with transformations
 * @returns {string} URL without f_auto,q_auto transformations
 */
const removeCloudinaryTransformations = (url) => {
  return url.replace(/\/f_auto,q_auto\//g, '/');
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
 * Download image from URL and save to local images directory
 * @param {string} imageUrl - Remote image URL
 * @param {string} contentType - Type of content (page, category, product)
 * @param {string} filename - Desired filename
 * @returns {Promise<string>} Local web path (e.g., '/images/products/image.webp')
 */
const downloadImage = async (imageUrl, contentType, filename) => {
  if (!imageUrl) return '';

  const sourceUrl = removeCloudinaryTransformations(imageUrl);
  const imagesDir = path.join(__dirname, '..', '..', '..', 'images', contentType);
  ensureDir(imagesDir);

  const localPath = path.join(imagesDir, filename);
  const webPath = `/images/${contentType}/${filename}`;

  try {
    await downloadFile(sourceUrl, localPath);
    return webPath;
  } catch (error) {
    console.error(`    Warning: Failed to download image from ${sourceUrl}:`, error.message);
    return '';
  }
};

/**
 * Generate a unique filename from URL for embedded images
 * @param {string} url - Image URL
 * @param {string} contentType - Type of content (page, category, product)
 * @param {string} slug - Content slug
 * @returns {string} Unique filename
 */
const generateEmbeddedImageFilename = (url, contentType, slug) => {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  const cloudinaryId = pathParts[pathParts.length - 1].split('.')[0];
  const extension = pathParts[pathParts.length - 1].split('.').pop() || 'webp';
  return `${contentType}-${slug}-${cloudinaryId}.${extension}`;
};

/**
 * Download embedded images from markdown content and update URLs
 * @param {string} content - Markdown content with image URLs
 * @param {string} contentType - Type of content (page, category, product)
 * @param {string} slug - Content slug
 * @returns {Promise<string>} Content with updated local image paths
 */
const downloadEmbeddedImages = async (content, contentType, slug) => {
  const imageRegex = /!\[([^\]]*)\]\((https:\/\/res\.cloudinary\.com\/[^)]+)\)/g;
  const matches = [...content.matchAll(imageRegex)];

  let updatedContent = content;

  for (const match of matches) {
    const altText = match[1];
    const imageUrl = match[2];
    const filename = generateEmbeddedImageFilename(imageUrl, contentType, slug);
    const webPath = await downloadImage(imageUrl, contentType, filename);

    if (webPath) {
      updatedContent = updatedContent.replace(
        `![${altText}](${imageUrl})`,
        `![${altText}](${webPath})`
      );
    }
  }

  return updatedContent;
};

module.exports = {
  downloadImage,
  downloadEmbeddedImages
};
