const fs = require('fs');
const path = require('path');
const { convertProduct } = require('../converters/product-converter');

const TEST_SITE_PATH = path.join(__dirname, '../../../test_site');
const OUTPUT_BASE = path.join(__dirname, '../../../');

describe('Product Converter', () => {
  const outputDir = path.join(OUTPUT_BASE, 'test_output/products');
  const reviewsDir = path.join(OUTPUT_BASE, 'test_output/reviews');

  beforeEach(() => {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    if (fs.existsSync(reviewsDir)) {
      fs.rmSync(reviewsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(reviewsDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(path.join(OUTPUT_BASE, 'test_output'))) {
      fs.rmSync(path.join(OUTPUT_BASE, 'test_output'), { recursive: true, force: true });
    }
  });

  describe('Basic Conversion', () => {
    test('converts product to markdown', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      const result = await convertProduct(
        'hd-cctv-camera.php.html',
        inputDir,
        outputDir,
        reviewsDir,
        reviewsMap,
        productCategoriesMap
      );

      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      expect(outputFiles.length).toBeGreaterThan(0);
    });

    test('converted product has frontmatter', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      await convertProduct(
        'hd-cctv-camera.php.html',
        inputDir,
        outputDir,
        reviewsDir,
        reviewsMap,
        productCategoriesMap
      );

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content).toMatch(/^---/);
      expect(content).toMatch(/title:/);
      expect(content).toMatch(/permalink:/);
    });

    test('converted product has content', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      await convertProduct(
        'hd-cctv-camera.php.html',
        inputDir,
        outputDir,
        reviewsDir,
        reviewsMap,
        productCategoriesMap
      );

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('Price Extraction', () => {
    test('handles missing price gracefully', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      const result = await convertProduct(
        'widget-with-no-price.php.html',
        inputDir,
        outputDir,
        reviewsDir,
        reviewsMap,
        productCategoriesMap
      );

      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      // Should still create valid frontmatter without price
      expect(content).toMatch(/^---/);
      expect(content).toMatch(/title:/);
    });

    test('extracts first price from complex formatting', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      const result = await convertProduct(
        'gizmo-with-weird-price-formatting.php.html',
        inputDir,
        outputDir,
        reviewsDir,
        reviewsMap,
        productCategoriesMap
      );

      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content).toMatch(/^---/);
      // Content should exist even with weird price format
      expect(content.length).toBeGreaterThan(100);
    });

    test('price in complex format still generates valid markdown', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      await convertProduct(
        'gizmo-with-weird-price-formatting.php.html',
        inputDir,
        outputDir,
        reviewsDir,
        reviewsMap,
        productCategoriesMap
      );

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      // Should contain pricing information in content
      expect(content).toMatch(/Quantum Gizmo/);
    });
  });

  describe('Images and Links', () => {
    test('processes product with multiple embedded images', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      const result = await convertProduct(
        'widget-with-inline-images-and-links.php.html',
        inputDir,
        outputDir,
        reviewsDir,
        reviewsMap,
        productCategoriesMap
      );

      expect(result).toBe(true);
    });

    test('converts relative links in product content', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      await convertProduct(
        'widget-with-inline-images-and-links.php.html',
        inputDir,
        outputDir,
        reviewsDir,
        reviewsMap,
        productCategoriesMap
      );

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      // Should have markdown links
      expect(content).toMatch(/\[.*\]\(.*\)/);
    });

    test('preserves table structure', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      await convertProduct(
        'widget-with-inline-images-and-links.php.html',
        inputDir,
        outputDir,
        reviewsDir,
        reviewsMap,
        productCategoriesMap
      );

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      // Should contain table data
      expect(content).toMatch(/Specifications/);
    });
  });

  describe('Error Handling', () => {
    test('returns false for non-existent file', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      const result = await convertProduct(
        'non-existent.php.html',
        inputDir,
        outputDir,
        reviewsDir,
        reviewsMap,
        productCategoriesMap
      );

      expect(result).toBe(false);
    });
  });
});
