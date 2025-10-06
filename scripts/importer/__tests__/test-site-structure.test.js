const fs = require('fs');
const path = require('path');

const TEST_SITE_PATH = path.join(__dirname, '../../../test_site');

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
    expect(files.some(f => f.endsWith('.html'))).toBe(true);
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

  test('test_site includes edge case files', () => {
    const pagesDir = path.join(TEST_SITE_PATH, 'pages');
    const files = fs.readdirSync(pagesDir);

    expect(files).toContain('empty-sections.php.html');
    expect(files).toContain('deeply-nested-content.php.html');
    expect(files.some(f => f.includes('special-chars'))).toBe(true);
  });

  test('test_site includes unusual blog posts', () => {
    const blogDir = path.join(TEST_SITE_PATH, 'blog');
    const files = fs.readdirSync(blogDir);

    expect(files).toContain('no-date-metadata.php.html');
    expect(files.some(f => f.includes('very-long-title'))).toBe(true);
  });

  test('test_site includes edge case products', () => {
    const productsDir = path.join(TEST_SITE_PATH, 'products');
    const files = fs.readdirSync(productsDir);

    expect(files).toContain('widget-with-no-price.php.html');
    expect(files).toContain('gizmo-with-weird-price-formatting.php.html');
  });
});
