#!/usr/bin/env node

/**
 * Backfill avatars for existing Google reviews
 * 
 * This script:
 * 1. Fetches all reviews from Apify API
 * 2. Matches them to existing review markdown files
 * 3. Downloads avatars and updates frontmatter with thumbnail field
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { downloadAvatar, ensureAvatarsDir } = require('./download-avatar');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const [key, ...value] = line.split('=');
      if (key && value.length && !process.env[key]) {
        process.env[key] = value.join('=').trim();
      }
    });
}

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const CONFIG = {
  siteConfigPath: path.join(__dirname, '..', '_data', 'site.json'),
  reviewsDir: path.join(__dirname, '..', 'reviews'),
  actorId: 'nwua9Gu5YrADL7ZDj',
  maxReviews: 9999
};

function makeApiRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);

    const request = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, response => {
      let responseData = '';
      response.on('data', chunk => responseData += chunk);
      response.on('end', () => {
        if (response.statusCode >= 400) {
          reject(new Error(`HTTP ${response.statusCode}: ${responseData}`));
        } else {
          resolve(responseData);
        }
      });
    });

    request.on('error', reject);
    request.setTimeout(120000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.write(postData);
    request.end();
  });
}

async function fetchReviews(placeId) {
  const url = `https://api.apify.com/v2/acts/${CONFIG.actorId}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`;
  const data = {
    startUrls: [{ url: `https://www.google.com/maps/place/?q=place_id:${placeId}` }],
    maxReviews: CONFIG.maxReviews,
    reviewsSort: 'newest',
    language: 'en'
  };

  console.log('Fetching reviews from Apify API...');

  const response = await makeApiRequest(url, data);
  const results = JSON.parse(response);

  if (!Array.isArray(results)) {
    throw new Error('Invalid API response format');
  }

  return results
    .flatMap(item => item.reviews || [])
    .map(review => ({
      content: review.text || review.reviewText || '',
      date: review.publishedAtDate ? new Date(review.publishedAtDate) : new Date(),
      author: review.name || review.authorName || 'Anonymous',
      photoUrl: review.reviewerPhotoUrl || ''
    }))
    .filter(review => review.content.length > 5);
}

/**
 * Parse frontmatter from markdown file
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatterLines = match[1].split('\n');
  const frontmatter = {};
  
  for (const line of frontmatterLines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  }

  return {
    frontmatter,
    body: match[2]
  };
}

/**
 * Rebuild markdown content with updated frontmatter
 */
function buildMarkdown(frontmatter, body) {
  const lines = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${value}`);
  
  return `---\n${lines.join('\n')}\n---\n${body}`;
}

/**
 * Normalize author name for matching
 */
function normalizeAuthor(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function main() {
  if (!APIFY_API_TOKEN) {
    console.error('Error: APIFY_API_TOKEN required in .env file');
    process.exit(1);
  }

  if (!fs.existsSync(CONFIG.siteConfigPath)) {
    console.error(`Error: ${CONFIG.siteConfigPath} not found`);
    process.exit(1);
  }

  const siteConfig = JSON.parse(fs.readFileSync(CONFIG.siteConfigPath, 'utf8'));
  if (!siteConfig.google_place_id) {
    console.error('Error: google_place_id missing from site.json');
    process.exit(1);
  }

  ensureAvatarsDir();

  try {
    // Fetch reviews from API
    const apiReviews = await fetchReviews(siteConfig.google_place_id);
    console.log(`Fetched ${apiReviews.length} reviews from API\n`);

    // Build lookup map by normalized author name
    const reviewsByAuthor = new Map();
    for (const review of apiReviews) {
      const key = normalizeAuthor(review.author);
      if (!reviewsByAuthor.has(key)) {
        reviewsByAuthor.set(key, []);
      }
      reviewsByAuthor.get(key).push(review);
    }

    // Find Google review files
    const reviewFiles = fs.readdirSync(CONFIG.reviewsDir)
      .filter(f => f.includes('-google-') && f.endsWith('.md'));

    console.log(`Found ${reviewFiles.length} Google review files to process\n`);

    let updated = 0;
    let skipped = 0;
    let noMatch = 0;
    let noPhoto = 0;

    for (const filename of reviewFiles) {
      const filepath = path.join(CONFIG.reviewsDir, filename);
      const content = fs.readFileSync(filepath, 'utf8');
      const parsed = parseFrontmatter(content);

      if (!parsed) {
        console.log(`  Skip: ${filename} (invalid frontmatter)`);
        skipped++;
        continue;
      }

      // Already has thumbnail
      if (parsed.frontmatter.thumbnail) {
        console.log(`  Skip: ${filename} (already has thumbnail)`);
        skipped++;
        continue;
      }

      const authorName = parsed.frontmatter.name;
      const normalizedAuthor = normalizeAuthor(authorName);
      const matchingReviews = reviewsByAuthor.get(normalizedAuthor) || [];

      if (matchingReviews.length === 0) {
        console.log(`  No match: ${filename}`);
        noMatch++;
        continue;
      }

      // Find review with photo (prefer first match with photo)
      const reviewWithPhoto = matchingReviews.find(r => r.photoUrl);

      if (!reviewWithPhoto) {
        console.log(`  No photo: ${filename}`);
        noPhoto++;
        continue;
      }

      // Download avatar
      const thumbnailPath = await downloadAvatar(reviewWithPhoto.photoUrl, authorName);

      if (!thumbnailPath) {
        console.log(`  Download failed: ${filename}`);
        skipped++;
        continue;
      }

      // Update frontmatter
      parsed.frontmatter.thumbnail = thumbnailPath;
      const newContent = buildMarkdown(parsed.frontmatter, parsed.body);
      fs.writeFileSync(filepath, newContent);

      console.log(`  Updated: ${filename}`);
      updated++;
    }

    console.log('\n--- Summary ---');
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`No match found: ${noMatch}`);
    console.log(`No photo available: ${noPhoto}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
