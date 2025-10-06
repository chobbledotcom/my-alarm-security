const fs = require('fs');
const path = require('path');
const { convertCategory } = require('../converters/category-converter');

const TEST_SITE_PATH = path.join(__dirname, '../../../test_site');
const OUTPUT_BASE = path.join(__dirname, '../../../');

describe('Category Converter', () => {
  const outputDir = path.join(OUTPUT_BASE, 'test_output/categories');

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
    test('converts category to markdown', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      const result = await convertCategory('burglar-alarms.php.html', inputDir, outputDir);

      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      expect(outputFiles.length).toBeGreaterThan(0);
    });

    test('converted category has frontmatter', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      await convertCategory('burglar-alarms.php.html', inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content).toMatch(/^---/);
      expect(content).toMatch(/title:/);
      expect(content).toMatch(/permalink:/);
    });

    test('converted category has content', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      await convertCategory('burglar-alarms.php.html', inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('Special Content Handling', () => {
    test('handles categories with strikethrough prices', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      const result = await convertCategory(
        'discontinued-widgets.php.html',
        inputDir,
        outputDir
      );

      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content).toMatch(/Discontinued Widgets/);
      expect(content).toMatch(/Legacy Products/);
    });

    test('preserves warning symbols and special formatting', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      await convertCategory('discontinued-widgets.php.html', inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      // Should contain content about warnings/discontinuation
      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('Code Samples and Technical Content', () => {
    test('handles categories with code blocks', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      const result = await convertCategory(
        'gizmos-with-code-samples.php.html',
        inputDir,
        outputDir
      );

      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content).toMatch(/Programmable Gizmos/);
    });

    test('preserves code block structure', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      await convertCategory('gizmos-with-code-samples.php.html', inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      // Should have code-like content or code markers
      expect(content.length).toBeGreaterThan(100);
      expect(content).toMatch(/API/);
    });

    test('handles inline code and HTML entities in code', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      await convertCategory('gizmos-with-code-samples.php.html', inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      // Should contain technical content
      expect(content).toMatch(/gizmo/i);
    });

    test('handles multiple pre/code blocks in single category', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      await convertCategory('gizmos-with-code-samples.php.html', inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      expect(outputFiles.length).toBe(1);

      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      // Should have multiple sections with technical content
      expect(content).toMatch(/Configuration/);
      expect(content).toMatch(/Shell Commands/);
    });
  });

  describe('Links and Navigation', () => {
    test('converts internal links to products', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      await convertCategory('burglar-alarms.php.html', inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      // Should have markdown-style links
      expect(content).toMatch(/\[.*\]\(.*\)/);
    });

    test('converts internal links to pages', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      await convertCategory('discontinued-widgets.php.html', inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      // Should contain links
      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('Error Handling', () => {
    test('returns false for non-existent file', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      const result = await convertCategory('non-existent.php.html', inputDir, outputDir);

      expect(result).toBe(false);
    });
  });
});
