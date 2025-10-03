# Site Importer

Modular site conversion tool for migrating content from the old MyAlarm Security site to the new Jekyll-based site.

## Structure

The importer is organized into separate modules for better maintainability and parallel development:

```
scripts/importer/
├── config.js                 # Configuration and paths
├── index.js                  # Main orchestrator
├── converters/
│   ├── index.js             # Exports all converters
│   ├── page-converter.js    # Converts static pages
│   ├── blog-converter.js    # Converts blog posts to news
│   ├── product-converter.js # Converts product pages
│   └── category-converter.js # Converts category pages
└── utils/
    ├── filesystem.js         # File operations
    ├── metadata-extractor.js # HTML metadata extraction
    ├── pandoc-converter.js   # HTML to Markdown conversion
    ├── content-processor.js  # Content cleaning and extraction
    └── frontmatter-generator.js # YAML frontmatter generation
```

## Usage

Run the conversion:
```bash
# From project root
node scripts/convert-old-site.js

# Or directly
node scripts/importer/index.js
```

## Module Responsibilities

### Config (`config.js`)
- Defines input/output paths
- Stores default values
- Central configuration

### Converters
Each converter handles a specific content type:
- **page-converter**: Static pages (about, contact, etc.)
- **blog-converter**: Blog posts → news articles
- **product-converter**: Product pages with pricing
- **category-converter**: Category landing pages

### Utils

#### `filesystem.js`
- Directory creation
- File reading/writing
- HTML file listing

#### `metadata-extractor.js`
- Extracts title, description, og:tags
- Extracts prices (products)
- Extracts categories (products)
- Extracts dates (blog posts)

#### `pandoc-converter.js`
- Converts HTML to Markdown via pandoc

#### `content-processor.js`
- Removes navigation/footer elements
- Cleans inline styles
- Removes pandoc artifacts
- Normalizes whitespace

#### `frontmatter-generator.js`
- Generates YAML frontmatter for each content type
- Ensures consistent field ordering

## Adding New Features

### To modify content cleaning:
Edit `utils/content-processor.js`

### To add new metadata fields:
1. Extract in `utils/metadata-extractor.js`
2. Add to frontmatter in `utils/frontmatter-generator.js`
3. Update relevant converter

### To add a new content type:
1. Create `converters/new-type-converter.js`
2. Export from `converters/index.js`
3. Add to orchestrator in `index.js`

## Dependencies

- Node.js built-in modules only
- pandoc (system dependency for HTML→Markdown conversion)

## Output

Converted files are placed in:
- `/pages/` - Static pages
- `/news/` - Blog posts
- `/products/` - Product pages
- `/categories/` - Category pages

Each file includes appropriate Jekyll frontmatter.