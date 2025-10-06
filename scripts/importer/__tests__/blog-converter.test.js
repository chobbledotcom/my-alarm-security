const fs = require('fs');
const path = require('path');
const { convertBlogPost } = require('../converters/blog-converter');

const TEST_SITE_PATH = path.join(__dirname, '../../../test_site');
const OUTPUT_BASE = path.join(__dirname, '../../../');

describe('Blog Converter', () => {
  const outputDir = path.join(OUTPUT_BASE, 'test_output/news');

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

  describe('Basic Conversion', () => {
    test('converts blog post to markdown', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const result = await convertBlogPost(
        'alarm-maintenance-tips.php.html',
        inputDir,
        outputDir
      );

      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      expect(outputFiles.length).toBeGreaterThan(0);
      expect(outputFiles[0]).toMatch(/\.md$/);
    });

    test('converted blog post has frontmatter with date', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      await convertBlogPost('alarm-maintenance-tips.php.html', inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content).toMatch(/^---/);
      expect(content).toMatch(/date:/);
      expect(content).toMatch(/title:/);
      expect(content).toMatch(/permalink:/);
    });

    test('converted blog post has content', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      await convertBlogPost('alarm-maintenance-tips.php.html', inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('Date Handling', () => {
    test('uses default date when no date metadata present', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const result = await convertBlogPost('no-date-metadata.php.html', inputDir, outputDir);

      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      const dateFile = outputFiles.find(f => f.includes('2020-01-01'));

      expect(dateFile).toBeTruthy();
    });

    test('filename includes date prefix', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      await convertBlogPost('no-date-metadata.php.html', inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      expect(outputFiles[0]).toMatch(/^\d{4}-\d{2}-\d{2}-/);
    });

    test('handles malformed date gracefully', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const result = await convertBlogPost(
        'malformed-date-2024-99-99.php.html',
        inputDir,
        outputDir
      );

      // Should still convert even with invalid date
      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      expect(outputFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Long Titles and Slugs', () => {
    test('handles extremely long titles', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const longTitleFile = fs
        .readdirSync(inputDir)
        .find(f => f.includes('very-long-title'));

      expect(longTitleFile).toBeTruthy();

      const result = await convertBlogPost(longTitleFile, inputDir, outputDir);
      expect(result).toBe(true);
    });

    test('creates valid filename from long title', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const longTitleFile = fs
        .readdirSync(inputDir)
        .find(f => f.includes('very-long-title'));

      await convertBlogPost(longTitleFile, inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      expect(outputFiles.length).toBeGreaterThan(0);

      // Filename should be valid (no special chars, reasonable length)
      expect(outputFiles[0]).toMatch(/^[\w-]+\.md$/);
    });

    test('long title appears in frontmatter', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const longTitleFile = fs
        .readdirSync(inputDir)
        .find(f => f.includes('very-long-title'));

      await convertBlogPost(longTitleFile, inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content).toMatch(/title:/);
      expect(content).toMatch(/Very Long Title/);
    });
  });

  describe('Error Handling', () => {
    test('returns false for non-existent file', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const result = await convertBlogPost('non-existent.php.html', inputDir, outputDir);

      expect(result).toBe(false);
    });
  });
});
