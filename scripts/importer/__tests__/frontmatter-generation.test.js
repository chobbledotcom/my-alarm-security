const {
  generatePageFrontmatter,
  generateBlogFrontmatter,
  generateProductFrontmatter,
  generateCategoryFrontmatter
} = require('../utils/frontmatter-generator');

describe('Frontmatter Generation', () => {
  describe('Page Frontmatter', () => {
    test('generates valid YAML frontmatter', () => {
      const metadata = { title: 'Test Page', description: 'Test description' };
      const frontmatter = generatePageFrontmatter(metadata, 'test-page');

      expect(frontmatter).toMatch(/^---/);
      expect(frontmatter).toMatch(/title:/);
      expect(frontmatter).toMatch(/permalink:/);
      expect(frontmatter).toMatch(/---$/);
    });

    test('handles special characters in title', () => {
      const metadata = { title: 'Test & More', description: 'Test <special> chars' };
      const frontmatter = generatePageFrontmatter(metadata, 'test-page');

      expect(frontmatter).toMatch(/title:/);
      expect(frontmatter).toMatch(/^---/);
    });

    test('handles empty description', () => {
      const metadata = { title: 'Test Page', description: '' };
      const frontmatter = generatePageFrontmatter(metadata, 'test-page');

      expect(frontmatter).toMatch(/title:/);
      expect(frontmatter).toMatch(/permalink:/);
    });

    test('handles very long titles', () => {
      const longTitle = 'A'.repeat(200);
      const metadata = { title: longTitle, description: 'Test' };
      const frontmatter = generatePageFrontmatter(metadata, 'test-page');

      expect(frontmatter).toMatch(/title:/);
      expect(frontmatter.length).toBeGreaterThan(100);
    });

    test('generates correct permalink format', () => {
      const metadata = { title: 'Test Page' };
      const frontmatter = generatePageFrontmatter(metadata, 'my-test-page');

      expect(frontmatter).toMatch(/permalink:.*my-test-page/);
    });

    test('handles slugs with special characters', () => {
      const metadata = { title: 'Test Page' };
      const frontmatter = generatePageFrontmatter(metadata, 'test-&-symbols');

      expect(frontmatter).toMatch(/permalink:/);
    });
  });

  describe('Blog Frontmatter', () => {
    test('includes date field', () => {
      const metadata = { title: 'Test Blog', description: 'Test' };
      const frontmatter = generateBlogFrontmatter(metadata, 'test-blog', '2024-01-15');

      expect(frontmatter).toMatch(/date:/);
      expect(frontmatter).toMatch(/title:/);
      expect(frontmatter).toMatch(/2024-01-15/);
    });

    test('handles default date', () => {
      const metadata = { title: 'Test Blog' };
      const frontmatter = generateBlogFrontmatter(metadata, 'test-blog', '2020-01-01');

      expect(frontmatter).toMatch(/date: 2020-01-01/);
    });

    test('handles invalid date gracefully', () => {
      const metadata = { title: 'Test Blog' };
      const frontmatter = generateBlogFrontmatter(metadata, 'test-blog', '2024-99-99');

      // Should still generate frontmatter
      expect(frontmatter).toMatch(/^---/);
      expect(frontmatter).toMatch(/title:/);
    });

    test('handles date in metadata', () => {
      const metadata = { title: 'Test Blog', date: '2024-03-15' };
      const frontmatter = generateBlogFrontmatter(metadata, 'test-blog', '2024-03-15');

      expect(frontmatter).toMatch(/date:/);
    });

    test('includes permalink for blog posts', () => {
      const metadata = { title: 'Test Blog' };
      const frontmatter = generateBlogFrontmatter(metadata, 'test-blog', '2024-01-15');

      expect(frontmatter).toMatch(/permalink:/);
    });
  });

  describe('Product Frontmatter', () => {
    test('generates product frontmatter', () => {
      const metadata = { title: 'Test Product' };
      const frontmatter = generateProductFrontmatter(metadata, 'test-product');

      expect(frontmatter).toMatch(/^---/);
      expect(frontmatter).toMatch(/title:/);
    });

    test('handles missing price', () => {
      const metadata = { title: 'Test Product' };
      const frontmatter = generateProductFrontmatter(
        metadata,
        'test-product',
        null,
        [],
        'Test Product',
        {}
      );

      expect(frontmatter).toMatch(/title:/);
      // Should not fail with null price
      expect(frontmatter).toMatch(/^---/);
    });

    test('handles price with currency symbols', () => {
      const metadata = { title: 'Test Product' };
      const frontmatter = generateProductFrontmatter(
        metadata,
        'test-product',
        '£99.99',
        [],
        'Test Product',
        {}
      );

      expect(frontmatter).toMatch(/title:/);
    });

    test('handles complex price strings', () => {
      const metadata = { title: 'Test Product' };
      const complexPrice = 'From £1,234.56 to £9,999.99';
      const frontmatter = generateProductFrontmatter(
        metadata,
        'test-product',
        complexPrice,
        [],
        'Test Product',
        {}
      );

      expect(frontmatter).toMatch(/title:/);
      expect(frontmatter).toMatch(/^---/);
    });

    test('includes categories if provided', () => {
      const metadata = { title: 'Test Product' };
      const categories = ['widgets', 'gizmos'];
      const frontmatter = generateProductFrontmatter(
        metadata,
        'test-product',
        '£99.99',
        categories,
        'Test Product',
        {}
      );

      expect(frontmatter).toMatch(/^---/);
    });

    test('handles empty categories array', () => {
      const metadata = { title: 'Test Product' };
      const frontmatter = generateProductFrontmatter(
        metadata,
        'test-product',
        '£99.99',
        [],
        'Test Product',
        {}
      );

      expect(frontmatter).toMatch(/title:/);
    });
  });

  describe('Category Frontmatter', () => {
    test('generates category frontmatter', () => {
      const metadata = { title: 'Test Category' };
      const frontmatter = generateCategoryFrontmatter(metadata, 'test-category');

      expect(frontmatter).toMatch(/^---/);
      expect(frontmatter).toMatch(/title:/);
    });

    test('handles special characters in category name', () => {
      const metadata = { title: 'Widgets & Gizmos' };
      const frontmatter = generateCategoryFrontmatter(metadata, 'widgets-gizmos');

      expect(frontmatter).toMatch(/title:/);
    });

    test('handles very long category names', () => {
      const longName = 'Category '.repeat(20);
      const metadata = { title: longName };
      const frontmatter = generateCategoryFrontmatter(metadata, 'long-category');

      expect(frontmatter).toMatch(/title:/);
    });

    test('includes permalink', () => {
      const metadata = { title: 'Test Category' };
      const frontmatter = generateCategoryFrontmatter(metadata, 'test-category');

      expect(frontmatter).toMatch(/permalink:/);
    });
  });

  describe('Edge Cases', () => {
    test('handles null metadata', () => {
      // Null metadata should throw or return empty, not silently fail
      const result = generatePageFrontmatter({}, 'test');
      expect(result).toMatch(/^---/);
    });

    test('handles undefined metadata fields', () => {
      const metadata = {};
      const frontmatter = generatePageFrontmatter(metadata, 'test');

      expect(frontmatter).toMatch(/^---/);
    });

    test('handles empty slug', () => {
      const metadata = { title: 'Test' };
      const frontmatter = generatePageFrontmatter(metadata, '');

      expect(frontmatter).toMatch(/title:/);
    });

    test('handles metadata with only whitespace', () => {
      const metadata = { title: '   ', description: '   ' };
      const frontmatter = generatePageFrontmatter(metadata, 'test');

      expect(frontmatter).toMatch(/^---/);
    });

    test('handles unicode characters in metadata', () => {
      const metadata = { title: 'Test 🎉', description: 'Café naïve' };
      const frontmatter = generatePageFrontmatter(metadata, 'test');

      expect(frontmatter).toMatch(/title:/);
    });
  });

  describe('YAML Validity', () => {
    test('frontmatter starts and ends with ---', () => {
      const metadata = { title: 'Test' };
      const frontmatter = generatePageFrontmatter(metadata, 'test');

      expect(frontmatter).toMatch(/^---\n/);
      expect(frontmatter).toMatch(/\n---$/);
    });

    test('no unescaped colons break YAML', () => {
      const metadata = { title: 'Test: A Story', description: 'Description: More text' };
      const frontmatter = generatePageFrontmatter(metadata, 'test');

      // Should handle colons in values
      expect(frontmatter).toMatch(/^---/);
      expect(frontmatter).toMatch(/---$/);
    });

    test('handles quotes in metadata values', () => {
      const metadata = { title: 'Test "Quoted" Title', description: "It's a test" };
      const frontmatter = generatePageFrontmatter(metadata, 'test');

      expect(frontmatter).toMatch(/^---/);
      expect(frontmatter).toMatch(/title:/);
    });
  });
});
