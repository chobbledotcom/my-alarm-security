#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OLD_SITE_PATH = path.join(__dirname, '../old_site/www.myalarmsecurity.co.uk');
const OUTPUT_BASE = path.join(__dirname, '..');

// Ensure output directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Extract metadata from HTML using regex
const extractMetadata = (htmlContent) => {
  const metadata = {};

  // Extract title
  const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    metadata.title = titleMatch[1].replace(/\s*-\s*My Alarm Security\s*$/, '').trim();
  }

  // Extract meta description
  const descMatch = htmlContent.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  if (descMatch) {
    metadata.meta_description = descMatch[1];
  }

  // Extract canonical URL for permalink
  const canonicalMatch = htmlContent.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
  if (canonicalMatch) {
    const url = canonicalMatch[1];
    const urlPath = url.replace(/^.*?\/([^\/]+\.php).*$/, '$1').replace('.php', '');
    metadata.permalink = `/${urlPath}/`;
  }

  // Extract og:title for header text
  const ogTitleMatch = htmlContent.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
  if (ogTitleMatch) {
    metadata.header_text = ogTitleMatch[1];
  }

  return metadata;
};

// Convert HTML content to markdown using pandoc
const convertToMarkdown = (htmlFile) => {
  try {
    const result = execSync(`pandoc -f html -t markdown "${htmlFile}" --wrap=none`, { encoding: 'utf8' });
    return result;
  } catch (error) {
    console.error(`Error converting ${htmlFile}:`, error.message);
    return '';
  }
};

// Extract main content from markdown (remove nav, footer, etc.)
const extractMainContent = (markdown, contentType) => {
  const lines = markdown.split('\n');
  let content = [];
  let inMainContent = false;
  let skipNext = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip navigation and header elements
    if (line.includes('navbar') || line.includes('drawer') || line.includes('breadcrumb')) {
      skipNext = true;
      continue;
    }

    // Skip footer content
    if (line.includes('footer') || line.includes('widget_section')) {
      break;
    }

    // Look for main content indicators
    if (contentType === 'blog' && (line.includes('# ') || line.includes('Posted By:'))) {
      inMainContent = true;
    } else if (contentType === 'page' && line.includes('# ')) {
      inMainContent = true;
    } else if (contentType === 'product' && line.includes('# ')) {
      inMainContent = true;
    } else if (contentType === 'category' && line.includes('# ')) {
      inMainContent = true;
    }

    if (inMainContent && !skipNext) {
      content.push(line);
    }

    skipNext = false;
  }

  return content.join('\n').trim();
};

// Extract blog post date from content
const extractBlogDate = (content) => {
  const dateMatch = content.match(/Posted Date:\s*(.*?)(?:\n|$)/);
  if (dateMatch) {
    try {
      return new Date(dateMatch[1]).toISOString().split('T')[0];
    } catch {
      return '2020-01-01'; // Default date
    }
  }
  return '2020-01-01';
};

// Clean up content
const cleanContent = (content) => {
  return content
    .replace(/Posted By:.*?\n/g, '') // Remove blog post metadata
    .replace(/:::\s*{[^}]*}\s*:::/g, '') // Remove pandoc divs
    .replace(/\{[^}]*\}/g, '') // Remove attribute blocks
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize whitespace
    .trim();
};

// Convert pages
const convertPages = () => {
  console.log('Converting pages...');
  ensureDir(path.join(OUTPUT_BASE, 'pages'));

  const pagesDir = path.join(OLD_SITE_PATH, 'pages');
  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

  files.forEach(file => {
    const htmlPath = path.join(pagesDir, file);
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const metadata = extractMetadata(htmlContent);
    const markdown = convertToMarkdown(htmlPath);
    const content = cleanContent(extractMainContent(markdown, 'page'));

    const filename = file.replace('.php.html', '.md');
    const slug = filename.replace('.md', '');
    const frontmatter = `---
header_text: "${metadata.header_text || metadata.title || ''}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/pages/${slug}/"
layout: page
---

${content}`;

    fs.writeFileSync(path.join(OUTPUT_BASE, 'pages', filename), frontmatter);
    console.log(`  Converted: ${filename}`);
  });
};

// Convert blog posts to news
const convertBlogPosts = () => {
  console.log('Converting blog posts to news...');
  ensureDir(path.join(OUTPUT_BASE, 'news'));

  const blogDir = path.join(OLD_SITE_PATH, 'blog');
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

  files.forEach(file => {
    const htmlPath = path.join(blogDir, file);
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const metadata = extractMetadata(htmlContent);
    const markdown = convertToMarkdown(htmlPath);
    const content = cleanContent(extractMainContent(markdown, 'blog'));
    const date = extractBlogDate(content);

    const slug = file.replace('.php.html', '');
    const filename = `${date}-${slug}.md`;

    const frontmatter = `---
title: "${metadata.title || slug.replace(/-/g, ' ')}"
date: ${date}
header_text: "${metadata.header_text || metadata.title || ''}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/news/${slug}/"
---

${content}`;

    fs.writeFileSync(path.join(OUTPUT_BASE, 'news', filename), frontmatter);
    console.log(`  Converted: ${filename}`);
  });
};

// Convert products
const convertProducts = () => {
  console.log('Converting products...');
  ensureDir(path.join(OUTPUT_BASE, 'products'));

  const productsDir = path.join(OLD_SITE_PATH, 'products');
  if (!fs.existsSync(productsDir)) {
    console.log('  No products directory found, skipping...');
    return;
  }

  const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.html'));

  files.forEach(file => {
    const htmlPath = path.join(productsDir, file);
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const metadata = extractMetadata(htmlContent);
    const markdown = convertToMarkdown(htmlPath);
    const content = cleanContent(extractMainContent(markdown, 'product'));

    // Extract price from HTML content
    let price = '';
    const priceTableMatch = htmlContent.match(/Our Price:<\/th>\s*<td[^>]*>\s*&pound;([\d,]+\.?\d*)/i);
    if (priceTableMatch) {
      price = `£${priceTableMatch[1]}`;
    } else {
      // Fallback: look for price in JSON-LD schema
      const schemaMatch = htmlContent.match(/"price":"([\d,]+\.?\d*)"/i);
      if (schemaMatch) {
        price = `£${schemaMatch[1]}`;
      }
    }

    // Extract category from breadcrumbs
    let category = '';
    const breadcrumbMatch = htmlContent.match(/<li class="breadcrumb-item"><a href="\.\.\/categories\/([^"]+)\.php\.html">/i);
    if (breadcrumbMatch) {
      category = breadcrumbMatch[1];
    }

    const filename = file.replace('.php.html', '.md');
    const slug = filename.replace('.md', '');

    const frontmatter = `---
title: "${metadata.title || ''}"
price: "${price}"
header_text: "${metadata.header_text || metadata.title || ''}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/products/${slug}/"
categories: ${category ? `["${category}"]` : '[]'}
features: []
---

${content}`;

    fs.writeFileSync(path.join(OUTPUT_BASE, 'products', filename), frontmatter);
    console.log(`  Converted: ${filename}`);
  });
};

// Convert categories
const convertCategories = () => {
  console.log('Converting categories...');
  ensureDir(path.join(OUTPUT_BASE, 'categories'));

  const categoriesDir = path.join(OLD_SITE_PATH, 'categories');
  if (!fs.existsSync(categoriesDir)) {
    console.log('  No categories directory found, skipping...');
    return;
  }

  const files = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.html'));

  files.forEach(file => {
    const htmlPath = path.join(categoriesDir, file);
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const metadata = extractMetadata(htmlContent);
    const markdown = convertToMarkdown(htmlPath);
    const content = cleanContent(extractMainContent(markdown, 'category'));

    const filename = file.replace('.php.html', '.md');
    const slug = filename.replace('.md', '');

    const frontmatter = `---
title: "${metadata.title || ''}"
header_text: "${metadata.header_text || metadata.title || ''}"
meta_title: "${metadata.title || ''}"
meta_description: "${metadata.meta_description || ''}"
permalink: "/categories/${slug}/"
featured: false
---

${content}`;

    fs.writeFileSync(path.join(OUTPUT_BASE, 'categories', filename), frontmatter);
    console.log(`  Converted: ${filename}`);
  });
};

// Main execution
const main = () => {
  console.log('Starting conversion of old MyAlarm Security site...\n');

  try {
    convertPages();
    console.log('');
    convertBlogPosts();
    console.log('');
    convertProducts();
    console.log('');
    convertCategories();
    console.log('\nConversion completed successfully!');
  } catch (error) {
    console.error('Error during conversion:', error);
    process.exit(1);
  }
};

main();