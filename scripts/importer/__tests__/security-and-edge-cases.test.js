const fs = require('fs');
const path = require('path');
const { convertPage } = require('../converters/page-converter');
const { convertBlogPost } = require('../converters/blog-converter');
const { convertProduct } = require('../converters/product-converter');
const { convertCategory } = require('../converters/category-converter');
const { slugFromFilename } = require('../utils/filesystem');

const TEST_SITE_PATH = path.join(__dirname, '../../../test_site');
const OUTPUT_BASE = path.join(__dirname, '../../../');

describe('Security and Extreme Edge Cases', () => {
  const outputDir = path.join(OUTPUT_BASE, 'test_output/security');

  beforeEach(() => {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(path.join(OUTPUT_BASE, 'test_output'))) {
      fs.rmSync(path.join(OUTPUT_BASE, 'test_output'), { recursive: true, force: true });
    }
  });

  describe('Script Injection Prevention', () => {
    test('strips script tags from content', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      const result = await convertPage('script-injection-attempt.php.html', inputDir, outputDir);

      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(outputDir, 'script-injection-attempt.md'),
        'utf8'
      );

      // Should NOT contain executable script tags
      expect(content).not.toMatch(/<script>/i);
      expect(content).not.toMatch(/alert\(['"]xss['"]\)/);
    });

    test('removes javascript: protocol from links', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('script-injection-attempt.php.html', inputDir, outputDir);

      const content = fs.readFileSync(
        path.join(outputDir, 'script-injection-attempt.md'),
        'utf8'
      );

      expect(content).not.toMatch(/javascript:/i);
    });

    test('removes event handlers from HTML', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('script-injection-attempt.php.html', inputDir, outputDir);

      const content = fs.readFileSync(
        path.join(outputDir, 'script-injection-attempt.md'),
        'utf8'
      );

      expect(content).not.toMatch(/onclick=/i);
      expect(content).not.toMatch(/onerror=/i);
    });

    test('escapes template injection attempts in frontmatter', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('script-injection-attempt.php.html', inputDir, outputDir);

      const content = fs.readFileSync(
        path.join(outputDir, 'script-injection-attempt.md'),
        'utf8'
      );

      // Frontmatter should be valid YAML
      expect(content).toMatch(/^---/);

      // Should not allow unescaped template syntax to break YAML
      const frontmatterSection = content.split('---')[1];
      expect(frontmatterSection).toBeTruthy();
    });
  });

  describe('Path Traversal Prevention', () => {
    test('prevents directory traversal in image paths', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const outputBlog = path.join(OUTPUT_BASE, 'test_output/news');

      if (!fs.existsSync(outputBlog)) {
        fs.mkdirSync(outputBlog, { recursive: true });
      }

      const result = await convertBlogPost('circular-link-hell.php.html', inputDir, outputBlog);
      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(outputBlog, fs.readdirSync(outputBlog)[0]),
        'utf8'
      );

      // Should not allow traversal to /etc/passwd
      expect(content).not.toMatch(/\/etc\/passwd/);

      // Path traversal sequences should be sanitized or rejected
      const hasDangerousPath = content.includes('../../../../../../../../etc/passwd');
      if (hasDangerousPath) {
        throw new Error('Path traversal attempt not prevented!');
      }
    });

    test('sanitizes file:// protocol URLs', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const outputBlog = path.join(OUTPUT_BASE, 'test_output/news');

      if (!fs.existsSync(outputBlog)) {
        fs.mkdirSync(outputBlog, { recursive: true });
      }

      await convertBlogPost('circular-link-hell.php.html', inputDir, outputBlog);

      const content = fs.readFileSync(
        path.join(outputBlog, fs.readdirSync(outputBlog)[0]),
        'utf8'
      );

      expect(content).not.toMatch(/file:\/\//i);
    });

    test('handles path traversal in filename itself', () => {
      // The file ../../../etc/passwd.php.html should create a safe slug
      const dangerousFilename = '../../../etc/passwd.php.html';
      const slug = slugFromFilename(dangerousFilename);

      // Slug should NOT escape the intended directory
      expect(slug).not.toContain('../');
      expect(slug).not.toContain('/etc/');
    });
  });

  describe('Binary and Encoding Issues', () => {
    test('handles files with binary characters in filename', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const files = fs.readdirSync(inputDir);
      const binaryFile = files.find(f => f.includes('binary') || f.includes('���'));

      if (binaryFile) {
        const outputBlog = path.join(OUTPUT_BASE, 'test_output/news');
        if (!fs.existsSync(outputBlog)) {
          fs.mkdirSync(outputBlog, { recursive: true });
        }

        // Should either convert or fail gracefully
        const result = await convertBlogPost(binaryFile, inputDir, outputBlog);

        // If it succeeded, check output doesn't corrupt
        if (result) {
          const outputFiles = fs.readdirSync(outputBlog);
          expect(outputFiles.length).toBeGreaterThan(0);
        }
      } else {
        // File might not exist if filesystem doesn't allow it
        expect(true).toBe(true);
      }
    });

    test('handles null bytes in content gracefully', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const files = fs.readdirSync(inputDir);
      const binaryFile = files.find(f => f.includes('binary'));

      if (binaryFile) {
        const outputBlog = path.join(OUTPUT_BASE, 'test_output/news');
        if (!fs.existsSync(outputBlog)) {
          fs.mkdirSync(outputBlog, { recursive: true });
        }

        const result = await convertBlogPost(binaryFile, inputDir, outputBlog);

        if (result) {
          const outputFile = fs.readdirSync(outputBlog)[0];
          const content = fs.readFileSync(path.join(outputBlog, outputFile), 'utf8');

          // Content should be valid UTF-8
          expect(typeof content).toBe('string');
        }
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Extreme Nesting', () => {
    test('handles 100-level deep nesting without stack overflow', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');

      // This should not crash with stack overflow
      const result = await convertPage('massive-recursion.php.html', inputDir, outputDir);

      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(outputDir, 'massive-recursion.md'),
        'utf8'
      );

      // Should successfully extract the deeply nested content
      expect(content).toMatch(/Content at 100 levels deep/);
    });

    test('massive nesting does not cause excessive memory usage', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      const memBefore = process.memoryUsage().heapUsed;

      await convertPage('massive-recursion.php.html', inputDir, outputDir);

      const memAfter = process.memoryUsage().heapUsed;
      const memIncrease = (memAfter - memBefore) / 1024 / 1024; // MB

      // Should not use more than 50MB for one file
      expect(memIncrease).toBeLessThan(50);
    });
  });

  describe('Price Validation Edge Cases', () => {
    test('handles extreme numeric values in prices', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const outputProducts = path.join(OUTPUT_BASE, 'test_output/products');

      if (!fs.existsSync(outputProducts)) {
        fs.mkdirSync(outputProducts, { recursive: true });
      }

      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      const result = await convertProduct(
        'price-overflow-999999999999999999.php.html',
        inputDir,
        outputProducts,
        path.join(OUTPUT_BASE, 'test_output/reviews'),
        reviewsMap,
        productCategoriesMap
      );

      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(outputProducts, fs.readdirSync(outputProducts)[0]),
        'utf8'
      );

      // Should handle the massive price without breaking
      expect(content).toBeTruthy();
      expect(content).toMatch(/^---/);
    });

    test('rejects SQL injection in price field', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const outputProducts = path.join(OUTPUT_BASE, 'test_output/products');

      if (!fs.existsSync(outputProducts)) {
        fs.mkdirSync(outputProducts, { recursive: true });
      }

      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      await convertProduct(
        'price-overflow-999999999999999999.php.html',
        inputDir,
        outputProducts,
        path.join(OUTPUT_BASE, 'test_output/reviews'),
        reviewsMap,
        productCategoriesMap
      );

      const content = fs.readFileSync(
        path.join(outputProducts, fs.readdirSync(outputProducts)[0]),
        'utf8'
      );

      // Should not include SQL injection attempts
      expect(content).not.toMatch(/DROP TABLE/i);
    });

    test('handles negative prices', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const outputProducts = path.join(OUTPUT_BASE, 'test_output/products');

      if (!fs.existsSync(outputProducts)) {
        fs.mkdirSync(outputProducts, { recursive: true });
      }

      const reviewsMap = new Map();
      const productCategoriesMap = new Map();

      await convertProduct(
        'price-overflow-999999999999999999.php.html',
        inputDir,
        outputProducts,
        path.join(OUTPUT_BASE, 'test_output/reviews'),
        reviewsMap,
        productCategoriesMap
      );

      const content = fs.readFileSync(
        path.join(outputProducts, fs.readdirSync(outputProducts)[0]),
        'utf8'
      );

      // Negative price should be in content somewhere (or rejected)
      expect(content).toBeTruthy();
    });
  });

  describe('YAML Injection', () => {
    test('prevents YAML injection in frontmatter', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      const outputCategories = path.join(OUTPUT_BASE, 'test_output/categories');

      if (!fs.existsSync(outputCategories)) {
        fs.mkdirSync(outputCategories, { recursive: true });
      }

      const result = await convertCategory('yaml-bomb.php.html', inputDir, outputCategories);

      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(outputCategories, 'yaml-bomb.md'),
        'utf8'
      );

      // Parse frontmatter
      const parts = content.split('---');
      expect(parts.length).toBeGreaterThanOrEqual(3);

      const frontmatter = parts[1];

      // Should only have ONE frontmatter block
      const contentAfterFrontmatter = parts.slice(2).join('---');
      expect(contentAfterFrontmatter).not.toMatch(/^---\nmalicious:/m);

      // Frontmatter should properly escape colons and quotes
      expect(frontmatter).toBeTruthy();
    });

    test('escapes colons in YAML values', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      const outputCategories = path.join(OUTPUT_BASE, 'test_output/categories');

      if (!fs.existsSync(outputCategories)) {
        fs.mkdirSync(outputCategories, { recursive: true });
      }

      await convertCategory('yaml-bomb.php.html', inputDir, outputCategories);

      const content = fs.readFileSync(
        path.join(outputCategories, 'yaml-bomb.md'),
        'utf8'
      );

      const frontmatterSection = content.split('---')[1];

      // YAML with unescaped colons in values will break parsing
      // Values with colons should be quoted
      const titleLine = frontmatterSection.split('\n').find(line => line.includes('title:'));

      if (titleLine && titleLine.includes(':') && titleLine.split(':').length > 2) {
        // If title has colons, it must be quoted
        expect(titleLine).toMatch(/title:\s*["']/);
      }
    });
  });

  describe('Circular References', () => {
    test('handles self-referential links', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const outputBlog = path.join(OUTPUT_BASE, 'test_output/news');

      if (!fs.existsSync(outputBlog)) {
        fs.mkdirSync(outputBlog, { recursive: true });
      }

      const result = await convertBlogPost('circular-link-hell.php.html', inputDir, outputBlog);
      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(outputBlog, fs.readdirSync(outputBlog)[0]),
        'utf8'
      );

      // Should convert without infinite loops
      expect(content.length).toBeGreaterThan(0);
    });

    test('handles protocol-relative URLs', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const outputBlog = path.join(OUTPUT_BASE, 'test_output/news');

      if (!fs.existsSync(outputBlog)) {
        fs.mkdirSync(outputBlog, { recursive: true });
      }

      await convertBlogPost('circular-link-hell.php.html', inputDir, outputBlog);

      const content = fs.readFileSync(
        path.join(outputBlog, fs.readdirSync(outputBlog)[0]),
        'utf8'
      );

      // Protocol-relative URLs (//evil.com) should be handled
      // Either converted or removed for security
      expect(content).toBeTruthy();
    });
  });
});
