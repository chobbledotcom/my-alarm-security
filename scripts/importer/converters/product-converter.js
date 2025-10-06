const path = require('path');
const config = require('../config');
const { ensureDir, readHtmlFile, writeMarkdownFile, listHtmlFiles, downloadFile, downloadEmbeddedImages } = require('../utils/filesystem');
const { extractMetadata, extractPrice, extractReviews, extractProductName, extractProductImages } = require('../utils/metadata-extractor');
const { convertToMarkdown } = require('../utils/pandoc-converter');
const { processContent } = require('../utils/content-processor');
const { generateProductFrontmatter, generateReviewFrontmatter } = require('../utils/frontmatter-generator');
const { scanProductCategories } = require('../utils/category-scanner');

/**
 * Remove Cloudinary transformation parameters to get original source URL
 * @param {string} url - Cloudinary URL with transformations
 * @returns {string} URL without f_auto,q_auto transformations
 */
const removeCloudinaryTransformations = (url) => {
  return url.replace(/\/f_auto,q_auto\//g, '/');
};

/**
 * Download product image and return local path
 * @param {string} imageUrl - Cloudinary URL
 * @param {string} slug - Product slug
 * @returns {Promise<string>} Local image path
 */
const downloadProductImage = async (imageUrl, slug) => {
  if (!imageUrl) return '';

  const sourceUrl = removeCloudinaryTransformations(imageUrl);
  const imagesDir = path.join(__dirname, '..', '..', '..', 'images', 'products');
  ensureDir(imagesDir);

  const filename = `${slug}.webp`;
  const localPath = path.join(imagesDir, filename);

  try {
    await downloadFile(sourceUrl, localPath);
    return `/images/products/${filename}`;
  } catch (error) {
    console.error(`    Warning: Failed to download image for ${slug}:`, error.message);
    return '';
  }
};

/**
 * Convert a single product HTML file to markdown
 * @param {string} file - HTML filename
 * @param {string} inputDir - Input directory path
 * @param {string} outputDir - Output directory path
 * @param {string} reviewsDir - Reviews output directory path
 * @param {Map} reviewsMap - Map to track reviews by name
 * @param {Map} productCategoriesMap - Map of product slug to categories
 * @returns {Promise<boolean>} Success status
 */
const convertProduct = async (file, inputDir, outputDir, reviewsDir, reviewsMap, productCategoriesMap) => {
  try {
    const htmlPath = path.join(inputDir, file);
    const htmlContent = readHtmlFile(htmlPath);
    const metadata = extractMetadata(htmlContent);
    const markdown = convertToMarkdown(htmlPath);
    const content = processContent(markdown, 'product');

    // Extract product-specific data
    const price = extractPrice(htmlContent);
    const reviews = extractReviews(htmlContent);
    const productName = extractProductName(htmlContent);
    const images = extractProductImages(htmlContent);

    const filename = file.replace('.php.html', '.md');
    const slug = filename.replace('.md', '');

    // Get all categories for this product from the scanner
    const categories = productCategoriesMap.get(slug) || [];

    // Create/update review files for this product
    if (reviews.length > 0) {
      reviews.forEach((review) => {
        const reviewSlug = review.name.toLowerCase().replace(/\s+/g, '-');
        const reviewFilename = `${reviewSlug}.md`;
        const reviewPath = path.join(reviewsDir, reviewFilename);

        // Check if review already exists
        if (reviewsMap.has(reviewSlug)) {
          const existingReview = reviewsMap.get(reviewSlug);
          if (!existingReview.products.includes(`products/${slug}.md`)) {
            existingReview.products.push(`products/${slug}.md`);
          }
          // Don't create duplicate file, just track the product relationship
        } else {
          // New review - create it
          const reviewData = {
            name: review.name,
            body: review.body,
            products: [`products/${slug}.md`]
          };
          reviewsMap.set(reviewSlug, reviewData);
        }
      });
    }

    // Download image and get local path
    const localImagePath = await downloadProductImage(images.header_image, slug);

    // Download embedded images in content
    const contentWithLocalImages = await downloadEmbeddedImages(content, 'products', slug);

    // Pass header image only (no gallery)
    const localImages = {
      header_image: localImagePath
    };

    const frontmatter = generateProductFrontmatter(metadata, slug, price, categories, productName, localImages);
    const fullContent = `${frontmatter}\n\n${contentWithLocalImages}`;

    writeMarkdownFile(path.join(outputDir, filename), fullContent);
    console.log(`  Converted: ${filename}`);
    return true;
  } catch (error) {
    console.error(`  Error converting ${file}:`, error.message);
    return false;
  }
};

/**
 * Convert all products from old site to markdown
 * @returns {Promise<Object>} Conversion results
 */
const convertProducts = async () => {
  console.log('Converting products...');

  const outputDir = path.join(config.OUTPUT_BASE, config.paths.products);
  const reviewsDir = path.join(config.OUTPUT_BASE, 'reviews');
  ensureDir(outputDir);
  ensureDir(reviewsDir);

  const productsDir = path.join(config.OLD_SITE_PATH, config.paths.products);
  const files = listHtmlFiles(productsDir);

  if (files.length === 0) {
    console.log('  No products directory found, skipping...');
    return { successful: 0, failed: 0, total: 0 };
  }

  // Scan all categories to build product-to-categories mapping
  console.log('  Scanning categories for product relationships...');
  const productCategoriesMap = scanProductCategories();

  const reviewsMap = new Map();
  let successful = 0;
  let failed = 0;

  for (const file of files) {
    if (await convertProduct(file, productsDir, outputDir, reviewsDir, reviewsMap, productCategoriesMap)) {
      successful++;
    } else {
      failed++;
    }
  }

  // Write all unique review files
  let reviewsCreated = 0;
  reviewsMap.forEach((reviewData, slug) => {
    const reviewFilename = `${slug}.md`;
    const reviewFrontmatter = generateReviewFrontmatter(reviewData.name, null);
    const productsYaml = reviewData.products.map(p => `"${p}"`).join(', ');
    const frontmatter = `---\nname: "${reviewData.name}"\nproducts: [${productsYaml}]\n---`;
    const reviewContent = `${frontmatter}\n\n${reviewData.body}`;

    writeMarkdownFile(path.join(reviewsDir, reviewFilename), reviewContent);
    reviewsCreated++;
  });

  if (reviewsCreated > 0) {
    console.log(`  Created ${reviewsCreated} unique review file(s)`);
  }

  return { successful, failed, total: files.length };
};

module.exports = {
  convertProduct,
  convertProducts
};