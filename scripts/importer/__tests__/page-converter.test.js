const fs = require('fs');
const path = require('path');
const { convertPage } = require('../converters/page-converter');

const TEST_SITE_PATH = path.join(__dirname, '../../../test_site');
const OUTPUT_BASE = path.join(__dirname, '../../../');

describe('Page Converter', () => {
  const outputDir = path.join(OUTPUT_BASE, 'test_output/pages');

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
    test('converts about-us page to markdown', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      const result = await convertPage('about-us.php.html', inputDir, outputDir);

      expect(result).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'about-us.md'))).toBe(true);
    });

    test('converted page has frontmatter', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('about-us.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'about-us.md'), 'utf8');
      expect(content).toMatch(/^---/);
      expect(content).toMatch(/title:/);
      expect(content).toMatch(/permalink:/);
    });

    test('converted page has content', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('about-us.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'about-us.md'), 'utf8');
      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('Special Characters Handling', () => {
    test('preserves special characters and entities', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      const result = await convertPage('special-chars-&-symbols.php.html', inputDir, outputDir);

      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(outputDir, 'special-chars-&-symbols.md'),
        'utf8'
      );

      // Check that content exists and has substantial length
      expect(content.length).toBeGreaterThan(100);
      expect(content).toMatch(/Special Characters/);
    });

    test('handles HTML entities in title', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('special-chars-&-symbols.php.html', inputDir, outputDir);

      const content = fs.readFileSync(
        path.join(outputDir, 'special-chars-&-symbols.md'),
        'utf8'
      );

      expect(content).toMatch(/title:/);
    });
  });

  describe('Empty and Whitespace Handling', () => {
    test('handles pages with empty sections', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      const result = await convertPage('empty-sections.php.html', inputDir, outputDir);

      expect(result).toBe(true);

      const content = fs.readFileSync(path.join(outputDir, 'empty-sections.md'), 'utf8');
      expect(content).toMatch(/Page With Empty Sections/);
      expect(content).toMatch(/Actual Content/);
    });

    test('empty sections do not create excessive blank lines', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('empty-sections.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'empty-sections.md'), 'utf8');

      // Count consecutive blank lines (more than 3 is excessive)
      const tripleBlankLines = content.match(/\n\n\n\n/g);
      expect(tripleBlankLines).toBeNull();
    });
  });

  describe('Deeply Nested Content', () => {
    test('flattens deeply nested HTML structures', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      const result = await convertPage('deeply-nested-content.php.html', inputDir, outputDir);

      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(outputDir, 'deeply-nested-content.md'),
        'utf8'
      );

      expect(content).toMatch(/Deeply Nested Widget Information/);
      expect(content).toMatch(/nested 10 levels deep/);
    });

    test('preserves list structure despite nesting', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('deeply-nested-content.php.html', inputDir, outputDir);

      const content = fs.readFileSync(
        path.join(outputDir, 'deeply-nested-content.md'),
        'utf8'
      );

      // Should have list markers
      expect(content).toMatch(/[-*]\s+/);
    });
  });

  describe('Error Handling', () => {
    test('returns false for non-existent file', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      const result = await convertPage('non-existent.php.html', inputDir, outputDir);

      expect(result).toBe(false);
    });
  });
});
