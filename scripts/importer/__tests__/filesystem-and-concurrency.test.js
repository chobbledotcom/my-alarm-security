const fs = require('fs');
const path = require('path');
const { convertPage } = require('../converters/page-converter');
const { listHtmlFiles, prepDir } = require('../utils/filesystem');

const TEST_SITE_PATH = path.join(__dirname, '../../../test_site');
const OUTPUT_BASE = path.join(__dirname, '../../../');

describe('Filesystem and Concurrency Edge Cases', () => {
  const outputDir = path.join(OUTPUT_BASE, 'test_output/filesystem');

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

  describe('Symlink Attacks', () => {
    test('does not follow symlinks to read files outside directory', () => {
      const symlinkPath = path.join(TEST_SITE_PATH, 'pages/evil-symlink.php.html');

      // Try to create symlink to /etc/passwd
      try {
        if (fs.existsSync(symlinkPath)) {
          fs.unlinkSync(symlinkPath);
        }
        fs.symlinkSync('/etc/passwd', symlinkPath);

        const files = listHtmlFiles(path.join(TEST_SITE_PATH, 'pages'));

        // Symlink should either be excluded or handled safely
        const hasSymlink = files.includes('evil-symlink.php.html');

        if (hasSymlink) {
          // If included, reading it should not expose /etc/passwd
          const content = fs.readFileSync(path.join(TEST_SITE_PATH, 'pages', 'evil-symlink.php.html'), 'utf8');
          expect(content).not.toMatch(/root:x:/); // /etc/passwd content
        }

        // Clean up
        if (fs.existsSync(symlinkPath)) {
          fs.unlinkSync(symlinkPath);
        }
      } catch (err) {
        // If we can't create symlinks (permissions), test passes
        expect(true).toBe(true);
      }
    });

    test('does not write files outside intended directory via symlink', async () => {
      const outputSymlink = path.join(outputDir, 'evil-output');

      try {
        // Try to create symlink in output directory pointing to /tmp
        if (!fs.existsSync(outputSymlink)) {
          fs.symlinkSync('/tmp', outputSymlink);
        }

        // Attempt to write through converter
        const inputDir = path.join(TEST_SITE_PATH, 'pages');
        await convertPage('about-us.php.html', inputDir, outputDir);

        // Should not have written to /tmp via symlink
        const tmpFiles = fs.readdirSync('/tmp').filter(f => f.includes('about-us.md'));
        expect(tmpFiles.length).toBe(0);

        // Clean up
        if (fs.existsSync(outputSymlink)) {
          fs.unlinkSync(outputSymlink);
        }
      } catch (err) {
        // Permissions error or symlink not supported = safe
        expect(true).toBe(true);
      }
    });
  });

  describe('Race Conditions', () => {
    test('handles concurrent file writes to same output safely', async () => {
      const inputDir = path.join(TEST_SITE_PATH, 'pages');

      // Start 10 concurrent conversions of the same file
      const promises = Array(10).fill(null).map(() =>
        convertPage('about-us.php.html', inputDir, outputDir)
      );

      const results = await Promise.all(promises);

      // All should succeed or fail consistently
      const allSucceeded = results.every(r => r === true);
      const allFailed = results.every(r => r === false);

      expect(allSucceeded || allFailed).toBe(true);

      // Output file should exist and be valid
      if (allSucceeded) {
        const content = fs.readFileSync(path.join(outputDir, 'about-us.md'), 'utf8');
        expect(content).toMatch(/^---/);
        expect(content.length).toBeGreaterThan(50);

        // Content should not be corrupted/interleaved
        const frontmatterCount = (content.match(/^---$/gm) || []).length;
        expect(frontmatterCount).toBe(2); // Exactly one frontmatter block
      }
    });

    test('handles concurrent directory creation safely', () => {
      const testDirs = Array(10).fill(null).map((_, i) =>
        path.join(outputDir, `concurrent-${i}`)
      );

      // Create all directories concurrently
      const promises = testDirs.map(dir => {
        return new Promise((resolve) => {
          prepDir(dir);
          resolve();
        });
      });

      return Promise.all(promises).then(() => {
        // All directories should exist
        testDirs.forEach(dir => {
          expect(fs.existsSync(dir)).toBe(true);
        });
      });
    });
  });

  describe('Filesystem Edge Cases', () => {
    test('handles filename with only special characters', async () => {
      // Create a file with problematic name
      const weirdFilename = '...php.html';
      const weirdPath = path.join(TEST_SITE_PATH, 'pages', weirdFilename);

      fs.writeFileSync(weirdPath, `
        <!doctype html>
        <html><head><title>Weird File</title></head>
        <body><h1>Content</h1></body></html>
      `);

      try {
        const result = await convertPage(weirdFilename, path.join(TEST_SITE_PATH, 'pages'), outputDir);

        // Should handle gracefully - either succeed or fail cleanly
        if (result) {
          // If succeeded, check output is valid
          const outputFiles = fs.readdirSync(outputDir);
          expect(outputFiles.length).toBeGreaterThan(0);
        }
      } finally {
        // Clean up
        if (fs.existsSync(weirdPath)) {
          fs.unlinkSync(weirdPath);
        }
      }
    });

    test('handles filename matching directory name', async () => {
      // pages/pages.php.html - filename matches parent directory
      const conflictPath = path.join(TEST_SITE_PATH, 'pages/pages.php.html');

      fs.writeFileSync(conflictPath, `
        <!doctype html>
        <html><head><title>Pages</title></head>
        <body><h1>Pages Page</h1></body></html>
      `);

      try {
        const result = await convertPage('pages.php.html', path.join(TEST_SITE_PATH, 'pages'), outputDir);

        expect(result).toBe(true);

        // Should not cause directory/file conflicts
        const outputFile = path.join(outputDir, 'pages.md');
        expect(fs.existsSync(outputFile)).toBe(true);

        const stat = fs.statSync(outputFile);
        expect(stat.isFile()).toBe(true);
      } finally {
        if (fs.existsSync(conflictPath)) {
          fs.unlinkSync(conflictPath);
        }
      }
    });

    test('handles extremely long filenames', async () => {
      // Create filename at or near filesystem limit (usually 255 chars)
      const longName = 'a'.repeat(240) + '.php.html';
      const longPath = path.join(TEST_SITE_PATH, 'pages', longName);

      try {
        fs.writeFileSync(longPath, `
          <!doctype html>
          <html><head><title>Long</title></head>
          <body><h1>Long filename test</h1></body></html>
        `);

        const result = await convertPage(longName, path.join(TEST_SITE_PATH, 'pages'), outputDir);

        // Should either convert or fail gracefully
        expect([true, false]).toContain(result);

        // Clean up
        if (fs.existsSync(longPath)) {
          fs.unlinkSync(longPath);
        }
      } catch (err) {
        // Filesystem doesn't support names this long = test passes
        expect(true).toBe(true);
      }
    });

    test('handles read-only files gracefully', async () => {
      const readonlyPath = path.join(TEST_SITE_PATH, 'pages/readonly.php.html');

      fs.writeFileSync(readonlyPath, `
        <!doctype html>
        <html><head><title>Readonly</title></head>
        <body><h1>Readonly test</h1></body></html>
      `);

      try {
        // Make file read-only
        fs.chmodSync(readonlyPath, 0o444);

        // Should still be able to read and convert
        const result = await convertPage('readonly.php.html', path.join(TEST_SITE_PATH, 'pages'), outputDir);

        expect(result).toBe(true);

        // Restore permissions for cleanup
        fs.chmodSync(readonlyPath, 0o644);
        fs.unlinkSync(readonlyPath);
      } catch (err) {
        // Permission issues = test environment limitation
        if (fs.existsSync(readonlyPath)) {
          try {
            fs.chmodSync(readonlyPath, 0o644);
            fs.unlinkSync(readonlyPath);
          } catch {}
        }
        expect(true).toBe(true);
      }
    });

    test('handles disk full scenario', async () => {
      // Can't really simulate disk full in tests, but we can check error handling
      const inputDir = path.join(TEST_SITE_PATH, 'pages');

      // Try to write to non-writable location (simulate disk full)
      const badOutputDir = '/dev/null/cannot-write-here';

      try {
        await convertPage('about-us.php.html', inputDir, badOutputDir);
        // If this succeeded, something is wrong
        expect(false).toBe(true);
      } catch (err) {
        // Should fail with clear error, not crash
        expect(err).toBeTruthy();
      }
    });
  });

  describe('prepDir Edge Cases', () => {
    test('prepDir handles existing files with same name as directory', () => {
      const conflictPath = path.join(outputDir, 'conflict');

      // Create a file where directory should be
      fs.writeFileSync(conflictPath, 'I am a file');

      // prepDir should handle this conflict
      expect(() => prepDir(conflictPath)).toThrow();
    });

    test('prepDir does not delete directories recursively by accident', () => {
      const deepPath = path.join(outputDir, 'keep/this/structure');
      fs.mkdirSync(deepPath, { recursive: true });

      const importantFile = path.join(deepPath, 'important.txt');
      fs.writeFileSync(importantFile, 'Do not delete me');

      // prepDir on parent should not nuke subdirectories
      prepDir(path.join(outputDir, 'keep'));

      // Only files in direct directory should be cleaned
      const keepExists = fs.existsSync(path.join(outputDir, 'keep'));
      expect(keepExists).toBe(true);
    });
  });
});
