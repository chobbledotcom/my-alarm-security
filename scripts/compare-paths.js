#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const oldSite = path.join(root, 'old_site');
const newSite = path.join(root, '_site');

// Clean and build the site
console.log('Building site...\n');

// Remove _site if it exists
if (fs.existsSync(newSite)) {
  fs.rmSync(newSite, { recursive: true, force: true });
}

try {
  execSync('npm run build', { cwd: root, stdio: 'inherit' });
  console.log('\n');
} catch (error) {
  console.error('Build failed!');
  process.exit(1);
}

// Check if _site exists
if (!fs.existsSync(newSite)) {
  console.error('Error: _site directory does not exist after build.');
  process.exit(1);
}

// Extract path from old site .php.html files
function getOldSitePaths() {
  const paths = [];

  function walkDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath, path.join(prefix, entry.name));
      } else if (entry.name.endsWith('.php.html')) {
        // Convert blog.php.html -> /blog
        // Convert blog/some-post.php.html -> /blog/some-post
        const pathName = entry.name.replace('.php.html', '');
        const urlPath = '/' + path.join(prefix, pathName).replace(/\\/g, '/');
        paths.push(urlPath);
      }
    }
  }

  walkDir(oldSite);
  return paths.sort();
}

// Extract paths from new site
function getNewSitePaths() {
  const paths = [];

  function walkDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip nested _site directories
      if (entry.name === '_site') {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Check if this directory has an index.html
        const indexPath = path.join(fullPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          const urlPath = '/' + path.join(prefix, entry.name).replace(/\\/g, '/');
          paths.push(urlPath);
        }
        walkDir(fullPath, path.join(prefix, entry.name));
      }
    }
  }

  // Check for root index.html
  if (fs.existsSync(path.join(newSite, 'index.html'))) {
    paths.push('/');
  }

  walkDir(newSite);
  return paths.sort();
}

// Normalize path for comparison
function normalizePath(p) {
  return p.replace(/\/$/, '') || '/';
}

// Map old paths to new paths (for paths that moved)
function mapOldToNew(oldPath) {
  // Blog posts moved to news
  if (oldPath.startsWith('/blog/')) {
    return oldPath.replace('/blog/', '/news/');
  }

  // Contact moved to pages/contact
  if (oldPath === '/contact') {
    return '/pages/contact';
  }

  // Reviews moved to pages/reviews
  if (oldPath === '/reviews') {
    return '/pages/reviews';
  }

  return oldPath;
}

// Compare paths
console.log('='.repeat(80));
console.log('PATH COMPARISON REPORT');
console.log('='.repeat(80));
console.log();

const oldPaths = getOldSitePaths();
const newPaths = getNewSitePaths();

console.log(`Old site paths (*.php.html): ${oldPaths.length}`);
console.log(`New site paths (directories with index.html): ${newPaths.length}`);
console.log();

// Create lookup sets
const oldPathsSet = new Set(oldPaths.map(normalizePath));
const newPathsSet = new Set(newPaths.map(normalizePath));

// Find matches and missing
const matched = [];
const missing = [];
const moved = [];

for (const oldPath of oldPaths) {
  const normalized = normalizePath(oldPath);
  const mapped = mapOldToNew(oldPath);

  if (newPathsSet.has(normalized)) {
    matched.push(oldPath);
  } else if (mapped !== oldPath && newPathsSet.has(normalizePath(mapped))) {
    moved.push({ old: oldPath, new: mapped });
  } else {
    missing.push(oldPath);
  }
}

// Find new paths that don't exist in old site
const newOnly = [];
const movedPaths = new Set(moved.map(m => normalizePath(m.new)));

for (const newPath of newPaths) {
  const normalized = normalizePath(newPath);
  if (!oldPathsSet.has(normalized) && !movedPaths.has(normalized)) {
    newOnly.push(newPath);
  }
}

// Print summary
const totalAccounted = matched.length + moved.length;
console.log('SUMMARY');
console.log('-'.repeat(80));
console.log(`✓ Exact matches: ${matched.length}/${oldPaths.length}`);
console.log(`→ Moved/renamed: ${moved.length}/${oldPaths.length}`);
console.log(`✓ Total accounted: ${totalAccounted}/${oldPaths.length} (${Math.round(totalAccounted / oldPaths.length * 100)}%)`);
console.log(`✗ Missing paths: ${missing.length}`);
console.log(`+ New paths only: ${newOnly.length}`);
console.log();

// Print matched paths
if (matched.length > 0) {
  console.log('EXACT MATCHES');
  console.log('-'.repeat(80));
  matched.forEach(p => console.log(`  ✓ ${p}`));
  console.log();
}

// Print moved paths
if (moved.length > 0) {
  console.log('MOVED/RENAMED PATHS');
  console.log('-'.repeat(80));
  moved.forEach(m => console.log(`  → ${m.old} => ${m.new}`));
  console.log();
}

// Print missing paths
if (missing.length > 0) {
  console.log('MISSING PATHS (in old site but not new site)');
  console.log('-'.repeat(80));
  missing.forEach(p => console.log(`  ✗ ${p}`));
  console.log();
}

// Print new-only paths
if (newOnly.length > 0) {
  console.log('NEW PATHS (in new site but not old site)');
  console.log('-'.repeat(80));
  newOnly.forEach(p => console.log(`  + ${p}`));
  console.log();
}

console.log('='.repeat(80));

// Exit with error if there are missing paths
if (missing.length > 0) {
  console.log(`\n⚠ ${missing.length} paths from old site are missing in new site`);
  process.exit(1);
} else {
  console.log('\n✓ All old site paths are present in new site!');
  process.exit(0);
}
