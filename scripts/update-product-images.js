#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const IMAGES_DIR = path.join(__dirname, '..', 'images', 'products');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Download a file from URL
const downloadFile = async (url, filepath) => {
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

// Extract og:image from HTML
const extractImageUrl = (htmlPath) => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const match = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
  return match ? match[1] : null;
};

// Generate simple filename from product slug
const getFilename = (productSlug) => {
  return `${productSlug}.webp`;
};

// Process a single product
const processProduct = async (productFile) => {
  const mdPath = path.join(__dirname, '..', 'products', productFile);
  const htmlFile = productFile.replace('.md', '.php.html');
  const htmlPath = path.join(__dirname, '..', 'old_site/www.myalarmsecurity.co.uk/products', htmlFile);
  const slug = productFile.replace('.md', '');

  if (!fs.existsSync(htmlPath)) {
    console.log(`  ⊘ Skipping ${productFile}: HTML not found`);
    return false;
  }

  const imageUrl = extractImageUrl(htmlPath);
  if (!imageUrl) {
    console.log(`  ⊘ Skipping ${productFile}: No image found`);
    return false;
  }

  // Read current markdown
  let content = fs.readFileSync(mdPath, 'utf8');

  // Check if already has gallery
  if (content.match(/^gallery:/m)) {
    console.log(`  ⊘ Skipping ${productFile}: Already has gallery`);
    return false;
  }

  // Download the image
  const filename = getFilename(slug);
  const localPath = path.join(IMAGES_DIR, filename);
  const imagePath = `/images/products/${filename}`;

  if (!fs.existsSync(localPath)) {
    console.log(`  ⬇ Downloading ${filename}...`);
    try {
      await downloadFile(imageUrl, localPath);
    } catch (error) {
      console.error(`  ✗ Failed to download ${filename}:`, error.message);
      return false;
    }
  } else {
    console.log(`  ✓ Image already exists: ${filename}`);
  }

  // Parse frontmatter carefully
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    console.log(`  ✗ Skipping ${productFile}: Invalid frontmatter`);
    return false;
  }

  let frontmatter = frontmatterMatch[1];
  const bodyContent = frontmatterMatch[2];

  // Extract title for alt text
  const titleMatch = frontmatter.match(/title: ["'](.*)["']/);
  const title = titleMatch ? titleMatch[1] : '';

  // Add header_image if not present
  if (!frontmatter.includes('header_image:')) {
    frontmatter += `\nheader_image: "${imagePath}"`;
  }

  // Add gallery if not present
  if (!frontmatter.includes('gallery:')) {
    frontmatter += `\ngallery:\n  - filename: "${imagePath}"\n    alt: "${title}"`;
  }

  // Write updated content WITHOUT modifying body
  const newContent = `---\n${frontmatter}\n---\n${bodyContent}`;
  fs.writeFileSync(mdPath, newContent);

  console.log(`  ✓ Updated ${productFile}`);
  return true;
};

// Main
const main = async () => {
  console.log('Updating product images...\n');

  const productFiles = fs.readdirSync(path.join(__dirname, '..', 'products'))
    .filter(f => f.endsWith('.md'));

  let updated = 0;
  for (const file of productFiles) {
    if (await processProduct(file)) {
      updated++;
    }
  }

  console.log(`\n✓ Processed ${updated} product(s)`);
};

main().catch(console.error);
