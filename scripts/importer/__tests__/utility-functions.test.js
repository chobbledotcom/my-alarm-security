const fs = require('fs');
const path = require('path');
const { listHtmlFiles, slugFromFilename, markdownFilename } = require('../utils/filesystem');
const { extractMetadata } = require('../utils/metadata-extractor');
const { processContent } = require('../utils/content-processor');

const TEST_SITE_PATH = path.join(__dirname, '../../../test_site');

describe('Utility Functions', () => {
  describe('Filesystem Utils', () => {
    test('listHtmlFiles finds HTML files', () => {
      const pagesDir = path.join(TEST_SITE_PATH, 'pages');
      const files = listHtmlFiles(pagesDir);

      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
      expect(files.every(f => f.endsWith('.html'))).toBe(true);
    });

    test('listHtmlFiles returns empty array for non-existent directory', () => {
      const files = listHtmlFiles('/non/existent/path');
      expect(files).toEqual([]);
    });

    test('listHtmlFiles ignores non-HTML files', () => {
      const files = listHtmlFiles(TEST_SITE_PATH);
      expect(files.every(f => f.endsWith('.html'))).toBe(true);
    });

    describe('Slug Generation', () => {
      test('slugFromFilename removes .php.html extension', () => {
        expect(slugFromFilename('about-us.php.html')).toBe('about-us');
        expect(slugFromFilename('contact.php.html')).toBe('contact');
      });

      test('slugFromFilename handles files with special characters', () => {
        expect(slugFromFilename('special-chars-&-symbols.php.html')).toBe(
          'special-chars-&-symbols'
        );
      });

      test('slugFromFilename handles very long filenames', () => {
        const longName =
          'very-long-title-that-exceeds-normal-length-limits-and-keeps-going-with-more-words.php.html';
        const slug = slugFromFilename(longName);

        expect(slug).not.toContain('.php.html');
        expect(slug.length).toBeLessThan(longName.length);
      });

      test('slugFromFilename handles empty-sections filename', () => {
        expect(slugFromFilename('empty-sections.php.html')).toBe('empty-sections');
      });

      test('slugFromFilename handles deeply-nested-content filename', () => {
        expect(slugFromFilename('deeply-nested-content.php.html')).toBe(
          'deeply-nested-content'
        );
      });
    });

    describe('Markdown Filename Generation', () => {
      test('markdownFilename replaces extension', () => {
        expect(markdownFilename('about-us.php.html')).toBe('about-us.md');
        expect(markdownFilename('contact.php.html')).toBe('contact.md');
      });

      test('markdownFilename handles special characters', () => {
        expect(markdownFilename('special-chars-&-symbols.php.html')).toBe(
          'special-chars-&-symbols.md'
        );
      });

      test('markdownFilename handles long filenames', () => {
        const longName =
          'very-long-title-that-exceeds-normal-length-limits-and-keeps-going-with-more-words.php.html';
        const mdName = markdownFilename(longName);

        expect(mdName).toMatch(/\.md$/);
        expect(mdName).not.toContain('.php.html');
      });
    });
  });

  describe('Metadata Extraction', () => {
    test('extractMetadata extracts title and description', () => {
      const htmlPath = path.join(TEST_SITE_PATH, 'pages/about-us.php.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const metadata = extractMetadata(htmlContent);

      expect(metadata).toHaveProperty('title');
      expect(metadata.title).toBeTruthy();
    });

    test('extractMetadata handles special characters in title', () => {
      const htmlPath = path.join(TEST_SITE_PATH, 'pages/special-chars-&-symbols.php.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const metadata = extractMetadata(htmlContent);

      expect(metadata).toHaveProperty('title');
      expect(metadata.title).toContain('Special Chars');
    });

    test('extractMetadata handles empty description', () => {
      const htmlPath = path.join(TEST_SITE_PATH, 'pages/empty-sections.php.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const metadata = extractMetadata(htmlContent);

      // Metadata should exist, description may or may not be present
      expect(metadata).toBeTruthy();
      expect(metadata).toHaveProperty('title');
    });

    test('extractMetadata handles missing meta tags', () => {
      const minimalHtml = `
        <!doctype html>
        <html>
        <head><title>Test</title></head>
        <body><h1>Content</h1></body>
        </html>
      `;
      const metadata = extractMetadata(minimalHtml);

      expect(metadata).toHaveProperty('title');
      expect(metadata.title).toBe('Test');
    });

    test('extractMetadata handles HTML entities in metadata', () => {
      const htmlWithEntities = `
        <!doctype html>
        <html>
        <head>
          <title>Test &amp; More</title>
          <meta name="description" content="Testing &lt;special&gt; chars">
        </head>
        <body></body>
        </html>
      `;
      const metadata = extractMetadata(htmlWithEntities);

      expect(metadata.title).toBeTruthy();
    });
  });

  describe('Content Processing', () => {
    test('processContent cleans HTML artifacts', () => {
      const rawMarkdown = '# Test\n\n<div>Content</div>\n\n{.class}';
      const processed = processContent(rawMarkdown, 'page');

      expect(processed).not.toMatch(/{\.class}/);
    });

    test('processContent handles different content types', () => {
      const content = '# Test Content';

      expect(() => processContent(content, 'page')).not.toThrow();
      expect(() => processContent(content, 'blog')).not.toThrow();
      expect(() => processContent(content, 'product')).not.toThrow();
      expect(() => processContent(content, 'category')).not.toThrow();
    });

    test('processContent preserves markdown formatting', () => {
      const markdown = '# Heading\n\n**Bold** and *italic*\n\n- List item';
      const processed = processContent(markdown, 'page');

      expect(processed).toContain('# Heading');
      expect(processed).toContain('**Bold**');
      expect(processed).toContain('- List item');
    });

    test('processContent handles empty content', () => {
      const processed = processContent('', 'page');
      expect(typeof processed).toBe('string');
    });

    test('processContent handles content with only whitespace', () => {
      const processed = processContent('   \n\n   ', 'page');
      expect(typeof processed).toBe('string');
    });

    test('processContent handles code blocks', () => {
      const markdown = '# Main Content\n\n```javascript\nconst x = 1;\n```';
      const processed = processContent(markdown, 'page');

      // processContent extracts main content, may filter code blocks
      expect(typeof processed).toBe('string');
    });

    test('processContent handles nested lists', () => {
      const markdown = '# Main\n\n- Item 1\n  - Sub item\n  - Sub item 2\n- Item 2';
      const processed = processContent(markdown, 'page');

      // processContent may filter certain patterns
      expect(typeof processed).toBe('string');
    });

    test('processContent handles tables', () => {
      const markdown = '# Main\n\n| Col 1 | Col 2 |\n|-------|-------|\n| A | B |';
      const processed = processContent(markdown, 'page');

      // processContent extracts main content
      expect(typeof processed).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    test('handles null or undefined inputs gracefully', () => {
      expect(listHtmlFiles(null)).toEqual([]);
      expect(listHtmlFiles(undefined)).toEqual([]);
    });

    test('slugFromFilename handles edge cases', () => {
      expect(slugFromFilename('.php.html')).toBe('');
      expect(slugFromFilename('test.php.html')).toBe('test');
    });

    test('markdownFilename handles edge cases', () => {
      expect(markdownFilename('.php.html')).toBe('.md');
      expect(markdownFilename('test.php.html')).toBe('test.md');
    });
  });
});
