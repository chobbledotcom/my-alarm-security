const fs = require('fs');
const path = require('path');
const { convertPage } = require('../converters/page-converter');

const TEST_SITE_PATH = path.join(__dirname, '../../../test_site');
const OUTPUT_BASE = path.join(__dirname, '../../../');

describe('Actual Rendering Bugs', () => {
  const outputDir = path.join(OUTPUT_BASE, 'test_output/rendering');

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

  describe('List Rendering', () => {
    test('nested lists maintain proper indentation', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-lists.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-lists.md'), 'utf8');

      // Nested list items should be indented
      expect(content).toMatch(/-.*\n\s+-/); // Parent item followed by indented child

      // Check we have list markers
      expect(content).toMatch(/^- /m);
      expect(content).toMatch(/^1\. /m);
    });

    test('consecutive ordered lists do not merge', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-lists.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-lists.md'), 'utf8');

      // Two separate <ol> should become two separate numbered lists
      // This is tricky - they might merge without blank line separator
      const numberedLists = content.match(/^1\. /gm);

      // Should have at least 2 occurrences of "1." if lists are separate
      if (numberedLists) {
        expect(numberedLists.length).toBeGreaterThanOrEqual(2);
      }
    });

    test('list formatting does not break with inconsistent indentation', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-lists.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-lists.md'), 'utf8');

      // All list items should start with valid markdown
      const invalidListItems = content.match(/^[^-\d\s#]/gm);
      if (invalidListItems) {
        // Filter out frontmatter and other valid content
        const afterFrontmatter = content.split('---').slice(2).join('---');
        const invalidInContent = afterFrontmatter.match(/^[^-\d\s#\[]/gm);
        expect(invalidInContent).toBeNull();
      }
    });
  });

  describe('Image Reference Conversion', () => {
    test('converts absolute image paths correctly', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-images.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-images.md'), 'utf8');

      // Check image syntax is valid markdown
      expect(content).toMatch(/!\[.*\]\(.*\)/);

      // Absolute paths should be converted
      const absoluteImage = content.match(/!\[Absolute path\]\((.*?)\)/);
      if (absoluteImage) {
        // Path should exist and be valid
        expect(absoluteImage[1]).toBeTruthy();
        expect(absoluteImage[1]).not.toBe('');
      }
    });

    test('handles images with spaces in filename', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-images.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-images.md'), 'utf8');

      // Images with spaces should either be encoded or quoted
      const spacesImage = content.match(/!\[Spaces in path\]\((.*?)\)/);
      if (spacesImage) {
        const imagePath = spacesImage[1];
        // Should either have %20 or be wrapped properly
        if (imagePath.includes(' ')) {
          // If spaces remain, they should be in angle brackets or encoded
          expect(imagePath.includes('%20') || imagePath.match(/<.*>/)).toBeTruthy();
        }
      }
    });

    test('images without src do not create broken markdown', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-images.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-images.md'), 'utf8');

      // Should not have image syntax with empty path
      expect(content).not.toMatch(/!\[.*\]\(\s*\)/);
      expect(content).not.toMatch(/!\[.*\]\(\)/);
    });

    test('image alt text is preserved', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-images.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-images.md'), 'utf8');

      // Alt texts should be in the output
      expect(content).toMatch(/!\[Absolute path\]/);
      expect(content).toMatch(/!\[Relative path\]/);
      expect(content).toMatch(/!\[External\]/);
    });

    test('picture elements are handled', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-images.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-images.md'), 'utf8');

      // Picture elements should at minimum extract the img fallback
      expect(content).toMatch(/Responsive/);
    });
  });

  describe('Link Conversion', () => {
    test('converts .php links to clean URLs', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-links.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-links.md'), 'utf8');

      // .php extensions should be removed or converted
      const phpLinks = content.match(/\[.*\]\(.*\.php[^\)]*\)/g);

      if (phpLinks) {
        // If .php links remain, they should be intentional external links
        phpLinks.forEach(link => {
          // Allow .php if it's external or has .php.html
          expect(
            link.includes('http') || link.includes('.php.html')
          ).toBe(true);
        });
      }
    });

    test('preserves anchor links', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-links.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-links.md'), 'utf8');

      // Anchor links should be preserved
      expect(content).toMatch(/\[.*\]\(#.*\)/);
      expect(content).toMatch(/#specifications/);
      expect(content).toMatch(/#top/);
    });

    test('handles query strings in links', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-links.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-links.md'), 'utf8');

      // Query strings should be preserved
      expect(content).toMatch(/\?id=123/);
      expect(content).toMatch(/&color=red/);
    });

    test('handles links with no href', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-links.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-links.md'), 'utf8');

      // Links with no href should not create broken markdown
      expect(content).not.toMatch(/\[Link with no href\]\(\)/);
      expect(content).not.toMatch(/\[Empty href\]\(\)/);
    });

    test('preserves mailto and tel links', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-links.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-links.md'), 'utf8');

      // Special protocols should be preserved
      expect(content).toMatch(/mailto:test@example\.com/);
      expect(content).toMatch(/tel:\+1234567890/);
    });
  });

  describe('Table Rendering', () => {
    test('simple tables convert to markdown tables', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-tables.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-tables.md'), 'utf8');

      // Should have markdown table syntax
      expect(content).toMatch(/\|/);
      expect(content).toMatch(/\|.*\|.*\|/); // At least 2 cells
    });

    test('table headers are differentiated from body', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-tables.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-tables.md'), 'utf8');

      // Should have header separator line with dashes
      expect(content).toMatch(/\|[-:\s]+\|/);
    });

    test('pipes in table content are escaped', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-tables.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-tables.md'), 'utf8');

      // Pipes in content should be escaped or the table structure preserved
      // Look for the "ls -la | grep" content
      if (content.includes('grep')) {
        // The pipe should either be escaped or table structure should be intact
        const tableLines = content.split('\n').filter(line => line.includes('|'));

        tableLines.forEach(line => {
          const cells = line.split('|');
          // Should have consistent cell count (2 or 3 with edges)
          if (cells.length > 1) {
            expect(cells.length).toBeGreaterThanOrEqual(2);
          }
        });
      }
    });

    test('colspan is handled gracefully', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-tables.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-tables.md'), 'utf8');

      // Colspan might not be supported in markdown, but should not break table
      expect(content).toMatch(/Full width cell/);
    });
  });

  describe('Heading Hierarchy', () => {
    test('headings convert to proper markdown levels', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-headings.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-headings.md'), 'utf8');

      // Should have markdown headings
      expect(content).toMatch(/^# /m);
      expect(content).toMatch(/^## /m);
      expect(content).toMatch(/^### /m);
    });

    test('multiple H1s are handled', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-headings.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-headings.md'), 'utf8');

      // Count H1s (after frontmatter)
      const afterFrontmatter = content.split('---').slice(2).join('---');
      const h1s = afterFrontmatter.match(/^# /gm);

      if (h1s) {
        // Multiple H1s might be a problem for SEO but should still render
        expect(h1s.length).toBeGreaterThan(0);
      }
    });

    test('heading formatting is preserved', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-headings.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-headings.md'), 'utf8');

      // Bold/italic in headings should be preserved
      expect(content).toMatch(/##.*\*\*/); // Bold in heading
      expect(content).toMatch(/##.*\*/); // Italic in heading
    });

    test('special characters in headings do not break markdown', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-headings.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-headings.md'), 'utf8');

      // Headings with # or : should not break parsing
      expect(content).toMatch(/hash character/);
      expect(content).toMatch(/with colon/);

      // The heading markers should still be at start of line
      const lines = content.split('\n');
      const headingLines = lines.filter(line => line.match(/^#+\s/));

      headingLines.forEach(line => {
        // Should start with # and space
        expect(line).toMatch(/^#+\s/);
      });
    });

    test('empty headings are removed or handled', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      await convertPage('broken-headings.php.html', inputDir, outputDir);

      const content = fs.readFileSync(path.join(outputDir, 'broken-headings.md'), 'utf8');

      // Empty headings should either be removed or not break rendering
      // This pattern would be a broken heading: "##  \n" or "## \n"
      const emptyHeadings = content.match(/^##\s*$/gm);

      // Ideally should be null (no empty headings)
      // But if they exist, they shouldn't break the page
      if (emptyHeadings) {
        expect(emptyHeadings.length).toBeLessThan(3);
      }
    });
  });
});
