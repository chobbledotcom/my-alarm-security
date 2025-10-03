#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Extract og:image from HTML
const extractImage = (htmlPath) => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const match = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
  return match ? match[1] : null;
};

// Process a single product
const addImageToProduct = (productFile) => {
  const mdPath = path.join(__dirname, '..', 'products', productFile);
  const htmlFile = productFile.replace('.md', '.php.html');
  const htmlPath = path.join(__dirname, '..', 'old_site/www.myalarmsecurity.co.uk/products', htmlFile);

  if (!fs.existsSync(htmlPath)) {
    console.log(`  Skipping ${productFile}: HTML not found`);
    return false;
  }

  const imageUrl = extractImage(htmlPath);
  if (!imageUrl) {
    console.log(`  Skipping ${productFile}: No image found`);
    return false;
  }

  // Read current markdown
  let content = fs.readFileSync(mdPath, 'utf8');

  // Check if already has image fields
  if (content.includes('cloudinary_header_image') || content.includes('product-image')) {
    console.log(`  Skipping ${productFile}: Already has images`);
    return false;
  }

  // Split into frontmatter and content
  const parts = content.split('---\n');
  if (parts.length < 3) {
    console.log(`  Skipping ${productFile}: Invalid frontmatter`);
    return false;
  }

  const frontmatter = parts[1];
  const bodyContent = parts.slice(2).join('---\n');

  // Add image fields to frontmatter (using cloudinary_ prefix to avoid template conflicts)
  const newFrontmatter = frontmatter + `cloudinary_header_image: "${imageUrl}"\ncloudinary_gallery: ["${imageUrl}"]\n`;

  // Extract title for alt text
  const titleMatch = frontmatter.match(/title: "(.*)"/);
  const title = titleMatch ? titleMatch[1] : '';

  // Add image HTML to body
  const imageHtml = `<div class="product-image">\n  <img src="${imageUrl}" alt="${title}" />\n</div>\n\n`;
  const newContent = `---\n${newFrontmatter}---\n\n${imageHtml}${bodyContent}`;

  // Write updated file
  fs.writeFileSync(mdPath, newContent);
  console.log(`  ✓ Added image to ${productFile}`);
  return true;
};

// Main
console.log('Adding images to products...\n');

const productFiles = fs.readdirSync(path.join(__dirname, '..', 'products'))
  .filter(f => f.endsWith('.md'));

let updated = 0;
productFiles.forEach(file => {
  if (addImageToProduct(file)) {
    updated++;
  }
});

console.log(`\n✓ Updated ${updated} product(s)`);
