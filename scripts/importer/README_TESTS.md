# Importer Test Suite

Comprehensive test suite for the site importer functionality.

## Test Structure

The test suite is located in `scripts/importer/__tests__/importer.test.js` and uses Jest as the testing framework.

## Test Site

A complete test site is available in `/root/repo/test_site/` with the following structure:

```
test_site/
├── index.html                    # Home page
├── blog.php.html                 # Blog index
├── contact.php.html              # Contact page
├── pages/
│   ├── about-us.php.html
│   └── contact.php.html
├── blog/
│   ├── alarm-maintenance-tips.php.html
│   └── choosing-the-right-cctv.php.html
├── products/
│   ├── wireless-alarm-system.php.html
│   └── hd-cctv-camera.php.html
├── categories/
│   ├── burglar-alarms.php.html
│   └── cctv.php.html
└── images/
    └── icons/
        └── favicon.ico
```

## Running Tests

```bash
# Install dependencies (first time only)
cd scripts/importer
npm install

# Run all tests
npm test

# Run tests with verbose output
npm test -- --verbose

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite includes 34 tests covering:

### 1. Test Site Structure (9 tests)
- Verifies test_site directory exists
- Checks all required subdirectories
- Validates presence of example files

### 2. Page Converter (4 tests)
- Tests conversion of pages to markdown
- Validates frontmatter generation
- Checks content preservation
- Tests multiple page types

### 3. Blog Converter (3 tests)
- Tests blog post conversion
- Validates date extraction and frontmatter
- Verifies content conversion

### 4. Product Converter (3 tests)
- Tests product conversion
- Validates product frontmatter
- Checks content preservation

### 5. Category Converter (3 tests)
- Tests category conversion
- Validates category frontmatter
- Verifies content conversion

### 6. Home Converter (1 test)
- Validates home page content extraction

### 7. Utility Functions (5 tests)
- Tests HTML file listing
- Validates metadata extraction
- Tests slug generation
- Tests filename conversion

### 8. Content Processing (2 tests)
- Tests HTML artifact cleaning
- Validates handling of different content types

### 9. Frontmatter Generation (4 tests)
- Tests page frontmatter generation
- Validates blog frontmatter with dates
- Tests product frontmatter
- Tests category frontmatter

### 10. Full Import Run (1 test)
- Validates test configuration setup

## Requirements

- Node.js (v14 or higher)
- Pandoc (must be installed on system)
- Jest (installed via npm)

## Test Output

All tests generate output in `test_output/` directory which is automatically cleaned up before and after test runs.

Example test output structure:
```
test_output/
├── pages/
│   ├── about-us.md
│   └── contact.md
├── news/
│   └── 2020-01-01-alarm-maintenance-tips.md
├── products/
│   └── wireless-alarm-system.md
└── categories/
    └── burglar-alarms.md
```

## Adding New Tests

To add new tests:

1. Create new HTML files in appropriate test_site subdirectories
2. Add test cases to `__tests__/importer.test.js`
3. Run tests to verify functionality

Example test:
```javascript
test('converts new page type', async () => {
  const inputDir = path.join(TEST_SITE_PATH, 'pages');
  const outputDir = path.join(OUTPUT_BASE, 'test_output/pages');

  const result = await convertPage('new-page.php.html', inputDir, outputDir);

  expect(result).toBe(true);
  expect(fs.existsSync(path.join(outputDir, 'new-page.md'))).toBe(true);
});
```

## Continuous Integration

The test suite can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: cd scripts/importer && npm install

- name: Run tests
  run: cd scripts/importer && npm test

- name: Generate coverage report
  run: cd scripts/importer && npm run test:coverage
```

## Troubleshooting

### Pandoc not found
Install pandoc before running tests:
- Ubuntu/Debian: `sudo apt-get install pandoc`
- macOS: `brew install pandoc`
- Windows: https://pandoc.org/installing.html

### Test failures
1. Check that test_site directory exists and has all required files
2. Verify pandoc is installed and accessible
3. Ensure npm dependencies are installed
4. Check test output directory permissions

## Maintenance

The test suite should be updated when:
- New converters are added
- Converter functionality changes
- New utility functions are created
- Output format changes

Keep test_site files simple but representative of real content to ensure tests remain fast while providing good coverage.
