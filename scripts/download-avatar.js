const fs = require('fs');
const path = require('path');
const https = require('https');

const AVATARS_DIR = path.join(__dirname, '..', 'images', 'reviewers');
const AVATAR_SIZE = 80;

/**
 * Ensure the avatars directory exists
 */
const ensureAvatarsDir = () => {
  if (!fs.existsSync(AVATARS_DIR)) {
    fs.mkdirSync(AVATARS_DIR, { recursive: true });
  }
};

/**
 * Convert reviewer name to a safe filename
 * @param {string} name - Reviewer name
 * @returns {string} Safe filename (without extension)
 */
const nameToFilename = (name) => {
  return (name || 'anonymous')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
};

/**
 * Transform Google profile photo URL to request specific size
 * Google URLs support size parameter like =s80 for 80px
 * @param {string} url - Original Google photo URL
 * @param {number} size - Desired size in pixels
 * @returns {string} URL with size parameter
 */
const getResizedUrl = (url, size = AVATAR_SIZE) => {
  if (!url) return '';
  
  // Remove existing size parameters and add new one
  // Google URLs often end with =s{number} or have -c-rp-mo patterns
  const cleanUrl = url.replace(/=s\d+.*$/, '').replace(/=w\d+.*$/, '');
  return `${cleanUrl}=s${size}-c`;
};

/**
 * Download an image from URL to local path
 * @param {string} url - URL to download from
 * @param {string} filepath - Local path to save
 * @returns {Promise<boolean>} Success status
 */
const downloadFile = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const makeRequest = (requestUrl, redirectCount = 0) => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }

      https.get(requestUrl, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          makeRequest(response.headers.location, redirectCount + 1);
          return;
        }

        if (response.statusCode === 200) {
          const writeStream = fs.createWriteStream(filepath);
          response.pipe(writeStream);
          writeStream.on('finish', () => {
            writeStream.close();
            resolve(true);
          });
          writeStream.on('error', (err) => {
            fs.unlink(filepath, () => {}); // Clean up partial file
            reject(err);
          });
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      }).on('error', reject);
    };

    makeRequest(url);
  });
};

/**
 * Download a reviewer's avatar image
 * @param {string} photoUrl - Google profile photo URL
 * @param {string} reviewerName - Reviewer name for filename
 * @returns {Promise<string>} Local web path to avatar, or empty string if failed
 */
const downloadAvatar = async (photoUrl, reviewerName) => {
  if (!photoUrl || !reviewerName) {
    return '';
  }

  ensureAvatarsDir();

  const filename = `${nameToFilename(reviewerName)}.jpg`;
  const localPath = path.join(AVATARS_DIR, filename);
  const webPath = `/images/reviewers/${filename}`;

  // Skip if already downloaded
  if (fs.existsSync(localPath)) {
    return webPath;
  }

  const resizedUrl = getResizedUrl(photoUrl, AVATAR_SIZE);

  try {
    await downloadFile(resizedUrl, localPath);
    return webPath;
  } catch (error) {
    console.error(`    Warning: Failed to download avatar for ${reviewerName}:`, error.message);
    return '';
  }
};

module.exports = {
  downloadAvatar,
  ensureAvatarsDir,
  nameToFilename,
  AVATARS_DIR,
  AVATAR_SIZE
};
