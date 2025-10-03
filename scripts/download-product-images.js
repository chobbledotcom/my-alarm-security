#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { pipeline } = require('stream/promises');

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

// Generate filename from URL
const getFilenameFromUrl = (url, productSlug) => {
  // Extract the Cloudinary public ID from the URL
  const match = url.match(/\/upload\/(?:.*?\/)?([\w]+)\.\w+$/);
  if (match) {
    return `${productSlug}-${match[1]}.webp`;
  }
  // Fallback
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

  // Check if already has local images
  if (content.includes('header_image:') && !content.includes('cloudinary_header_image')) {
    console.log(`  ⊘ Skipping ${productFile}: Already has local images`);
    return false;
  }

  // Download the image
  const filename = getFilenameFromUrl(imageUrl, slug);
  const localPath = path.join(IMAGES_DIR, filename);

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

  // Update markdown file
  // Path for frontmatter (relative to src/images/)
  const frontmatterPath = `products/${filename}`;
  // Path for HTML img tag (absolute URL)
  const imgSrc = `/images/products/${filename}`;

  // Remove cloudinary fields if they exist
  content = content.replace(/^cloudinary_header_image:.*\n/m, '');
  content = content.replace(/^cloudinary_gallery:.*\n/m, '');

  // Split into frontmatter and body
  const parts = content.split('---\n');
  if (parts.length < 3) {
    console.log(`  ✗ Skipping ${productFile}: Invalid frontmatter`);
    return false;
  }

  let frontmatter = parts[1];
  const bodyContent = parts.slice(2).join('---\n');

  // Add header_image and gallery fields (using path relative to src/images/)
  if (!frontmatter.includes('header_image:')) {
    frontmatter += `header_image: "${frontmatterPath}"\n`;
  }
  if (!frontmatter.includes('gallery:')) {
    frontmatter += `gallery:\n  - filename: "${frontmatterPath}"\n    alt: ""\n`;
  }

  // Update or add product-image div in content
  let newBodyContent = bodyContent;
  const titleMatch = frontmatter.match(/title: "(.*)"/);
  const title = titleMatch ? titleMatch[1] : '';

  if (bodyContent.includes('product-image')) {
    // Update existing image
    newBodyContent = bodyContent.replace(
      /<div class="product-image">[\s\S]*?<\/div>/,
      `<div class="product-image">\n  <img src="${imgSrc}" alt="${title}" />\n</div>`
    );
  } else {
    // Add new image at start
    newBodyContent = `<div class="product-image">\n  <img src="${imgSrc}" alt="${title}" />\n</div>\n\n${bodyContent}`;
  }

  const newContent = `---\n${frontmatter}---\n\n${newBodyContent}`;
  fs.writeFileSync(mdPath, newContent);

  console.log(`  ✓ Updated ${productFile}`);
  return true;
};

// Main
const main = async () => {
  console.log('Downloading product images and updating references...\n');

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
