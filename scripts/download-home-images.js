#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { downloadImage } = require('./importer/utils/image-downloader');

/**
 * Download images for home page featured section
 * Updates home_content.json with local image paths
 */
const downloadHomeImages = async () => {
  const homeContentPath = path.join(__dirname, '..', '_data', 'home_content.json');
  const homeContent = JSON.parse(fs.readFileSync(homeContentPath, 'utf-8'));

  console.log('Downloading home page featured images...');

  if (homeContent.hero?.service_cards) {
    for (const card of homeContent.hero.service_cards) {
      if (card.image && card.image.startsWith('https://')) {
        console.log(`  Downloading: ${card.title}`);
        const slug = card.title.toLowerCase().replace(/\s+/g, '-');
        const localPath = await downloadImage(card.image, 'home', slug);

        if (localPath) {
          card.image = localPath;
          console.log(`    Saved to: ${localPath}`);
        }
      }
    }
  }

  // Write updated content back
  fs.writeFileSync(homeContentPath, JSON.stringify(homeContent, null, 2) + '\n');
  console.log('\nUpdated home_content.json with local image paths');
};

downloadHomeImages().catch(error => {
  console.error('Error downloading home images:', error);
  process.exit(1);
});
