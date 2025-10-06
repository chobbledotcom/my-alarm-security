const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEST_SITE_PATH = path.join(__dirname, '../../../test_site');
const OUTPUT_BASE = path.join(__dirname, '../../../');

describe('Importer Test Suite', () => {
  let originalConfig;

  beforeAll(() => {
    // Check pandoc is installed
    try {
      execSync('pandoc --version', { stdio: 'ignore' });
    } catch (error) {
      throw new Error('Pandoc must be installed to run tests');
    }

    // Backup original config
    const configPath = path.join(__dirname, '../config.js');
    originalConfig = require(configPath);

    // Clean up any previous test outputs
    cleanTestOutputs();
  });

  afterAll(() => {
    // Clean up test outputs
    cleanTestOutputs();
  });

  describe('Test Site Structure', () => {
    test('test_site directory exists', () => {
      expect(fs.existsSync(TEST_SITE_PATH)).toBe(true);
    });

    test('test_site has required subdirectories', () => {
      expect(fs.existsSync(path.join(TEST_SITE_PATH, 'pages'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_SITE_PATH, 'blog'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_SITE_PATH, 'products'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_SITE_PATH, 'categories'))).toBe(true);
    });

    test('test_site has home page', () => {
      expect(fs.existsSync(path.join(TEST_SITE_PATH, 'index.html'))).toBe(true);
    });

    test('test_site has contact page', () => {
      expect(fs.existsSync(path.join(TEST_SITE_PATH, 'contact.php.html'))).toBe(true);
    });

    test('test_site has blog index', () => {
      expect(fs.existsSync(path.join(TEST_SITE_PATH, 'blog.php.html'))).toBe(true);
    });

    test('test_site has example pages', () => {
      const pagesDir = path.join(TEST_SITE_PATH, 'pages');
      const files = fs.readdirSync(pagesDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files).toContain('about-us.php.html');
    });

    test('test_site has example blog posts', () => {
      const blogDir = path.join(TEST_SITE_PATH, 'blog');
      const files = fs.readdirSync(blogDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.endsWith('.html'))).toBe(true);
    });

    test('test_site has example products', () => {
      const productsDir = path.join(TEST_SITE_PATH, 'products');
      const files = fs.readdirSync(productsDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.endsWith('.html'))).toBe(true);
    });

    test('test_site has example categories', () => {
      const categoriesDir = path.join(TEST_SITE_PATH, 'categories');
      const files = fs.readdirSync(categoriesDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.endsWith('.html'))).toBe(true);
    });
  });

  describe('Page Converter', () => {
    const { convertPage } = require('../converters/page-converter');
    const outputDir = path.join(OUTPUT_BASE, 'test_output/pages');

    beforeEach(() => {
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
      }
      fs.mkdirSync(outputDir, { recursive: true });
    });

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
      expect(content).toMatch(/About Test Security/);
    });

    test('converts contact page to markdown', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');
      const result = await convertPage('contact.php.html', inputDir, outputDir);

      expect(result).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'contact.md'))).toBe(true);
    });
  });

  describe('Blog Converter', () => {
    const { convertBlogPost } = require('../converters/blog-converter');
    const outputDir = path.join(OUTPUT_BASE, 'test_output/news');

    beforeEach(() => {
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
      }
      fs.mkdirSync(outputDir, { recursive: true });
    });

    test('converts blog post to markdown', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const blogFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));
      expect(blogFiles.length).toBeGreaterThan(0);

      const result = await convertBlogPost(blogFiles[0], inputDir, outputDir);
      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      expect(outputFiles.length).toBeGreaterThan(0);
    });

    test('converted blog post has frontmatter with date', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const blogFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));
      await convertBlogPost(blogFiles[0], inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content).toMatch(/^---/);
      expect(content).toMatch(/date:/);
      expect(content).toMatch(/title:/);
      expect(content).toMatch(/permalink:/);
    });

    test('converted blog post has content', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'blog');
      const blogFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));
      await convertBlogPost(blogFiles[0], inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('Product Converter', () => {
    const { convertProduct } = require('../converters/product-converter');
    const outputDir = path.join(OUTPUT_BASE, 'test_output/products');

    beforeEach(() => {
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
      }
      fs.mkdirSync(outputDir, { recursive: true });
    });

    test('converts product to markdown', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const productFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));
      expect(productFiles.length).toBeGreaterThan(0);

      const result = await convertProduct(productFiles[0], inputDir, outputDir);
      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      expect(outputFiles.length).toBeGreaterThan(0);
    });

    test('converted product has frontmatter', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const productFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));
      await convertProduct(productFiles[0], inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content).toMatch(/^---/);
      expect(content).toMatch(/title:/);
      expect(content).toMatch(/permalink:/);
    });

    test('converted product has content', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'products');
      const productFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));
      await convertProduct(productFiles[0], inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('Category Converter', () => {
    const { convertCategory } = require('../converters/category-converter');
    const outputDir = path.join(OUTPUT_BASE, 'test_output/categories');

    beforeEach(() => {
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
      }
      fs.mkdirSync(outputDir, { recursive: true });
    });

    test('converts category to markdown', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      const categoryFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));
      expect(categoryFiles.length).toBeGreaterThan(0);

      const result = await convertCategory(categoryFiles[0], inputDir, outputDir);
      expect(result).toBe(true);

      const outputFiles = fs.readdirSync(outputDir);
      expect(outputFiles.length).toBeGreaterThan(0);
    });

    test('converted category has frontmatter', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      const categoryFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));
      await convertCategory(categoryFiles[0], inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content).toMatch(/^---/);
      expect(content).toMatch(/title:/);
      expect(content).toMatch(/permalink:/);
    });

    test('converted category has content', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'categories');
      const categoryFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));
      await convertCategory(categoryFiles[0], inputDir, outputDir);

      const outputFiles = fs.readdirSync(outputDir);
      const content = fs.readFileSync(path.join(outputDir, outputFiles[0]), 'utf8');

      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('Home Converter', () => {
    test('test_site has home page content', () => {
      const htmlPath = path.join(TEST_SITE_PATH, 'index.html');
      expect(fs.existsSync(htmlPath)).toBe(true);

      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      expect(htmlContent).toMatch(/Welcome to Test Security/);
      expect(htmlContent).toMatch(/<h1>/);
    });
  });

  describe('Utility Functions', () => {
    const { listHtmlFiles } = require('../utils/filesystem');
    const { extractMetadata } = require('../utils/metadata-extractor');
    const { slugFromFilename, markdownFilename } = require('../utils/filesystem');

    test('listHtmlFiles finds HTML files', () => {
      const pagesDir = path.join(TEST_SITE_PATH, 'pages');
      const files = listHtmlFiles(pagesDir);

      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
      expect(files.every(f => f.endsWith('.html'))).toBe(true);
    });

    test('extractMetadata extracts title and description', () => {
      const htmlPath = path.join(TEST_SITE_PATH, 'pages/about-us.php.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const metadata = extractMetadata(htmlContent);

      expect(metadata).toHaveProperty('title');
      expect(metadata.title).toBeTruthy();
      expect(metadata.title).toMatch(/About/);
    });

    test('slugFromFilename creates correct slug', () => {
      expect(slugFromFilename('about-us.php.html')).toBe('about-us');
      expect(slugFromFilename('contact.php.html')).toBe('contact');
      expect(slugFromFilename('test-page.php.html')).toBe('test-page');
    });

    test('markdownFilename creates correct markdown filename', () => {
      expect(markdownFilename('about-us.php.html')).toBe('about-us.md');
      expect(markdownFilename('contact.php.html')).toBe('contact.md');
      expect(markdownFilename('test-page.php.html')).toBe('test-page.md');
    });
  });

  describe('Content Processing', () => {
    const { processContent } = require('../utils/content-processor');

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
  });

  describe('Frontmatter Generation', () => {
    const {
      generatePageFrontmatter,
      generateBlogFrontmatter,
      generateProductFrontmatter,
      generateCategoryFrontmatter
    } = require('../utils/frontmatter-generator');

    test('generatePageFrontmatter creates valid frontmatter', () => {
      const metadata = { title: 'Test Page', description: 'Test description' };
      const frontmatter = generatePageFrontmatter(metadata, 'test-page');

      expect(frontmatter).toMatch(/^---/);
      expect(frontmatter).toMatch(/title:/);
      expect(frontmatter).toMatch(/permalink:/);
      expect(frontmatter).toMatch(/---$/);
    });

    test('generateBlogFrontmatter includes date', () => {
      const metadata = { title: 'Test Blog', description: 'Test', date: '2024-01-15' };
      const frontmatter = generateBlogFrontmatter(metadata, 'test-blog');

      expect(frontmatter).toMatch(/date:/);
      expect(frontmatter).toMatch(/title:/);
    });

    test('generateProductFrontmatter creates product frontmatter', () => {
      const metadata = { title: 'Test Product' };
      const frontmatter = generateProductFrontmatter(metadata, 'test-product');

      expect(frontmatter).toMatch(/^---/);
      expect(frontmatter).toMatch(/title:/);
    });

    test('generateCategoryFrontmatter creates category frontmatter', () => {
      const metadata = { title: 'Test Category' };
      const frontmatter = generateCategoryFrontmatter(metadata, 'test-category');

      expect(frontmatter).toMatch(/^---/);
      expect(frontmatter).toMatch(/title:/);
    });
  });

  describe('Full Import Run', () => {
    test('can create test config for import', () => {
      const testConfig = {
        OLD_SITE_PATH: TEST_SITE_PATH,
        OUTPUT_BASE: path.join(OUTPUT_BASE, 'test_output'),
        DEFAULT_DATE: '2020-01-01',
        paths: {
          pages: 'pages',
          news: 'news',
          products: 'products',
          categories: 'categories',
          blog: 'blog',
          favicon: 'assets/favicon'
        }
      };

      expect(testConfig.OLD_SITE_PATH).toBe(TEST_SITE_PATH);
      expect(fs.existsSync(testConfig.OLD_SITE_PATH)).toBe(true);
    });
  });
});

function cleanTestOutputs() {
  const testOutputDir = path.join(OUTPUT_BASE, 'test_output');
  if (fs.existsSync(testOutputDir)) {
    fs.rmSync(testOutputDir, { recursive: true, force: true });
  }
}
