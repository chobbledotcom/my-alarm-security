const path = require('path');
const fs = require('fs');
const config = require('../config');
const { ensureDir, writeMarkdownFile } = require('../utils/filesystem');

/**
 * Generate home.md from index.html metadata
 */
const generateHomePage = () => {
  const indexPath = path.join(config.OLD_SITE_PATH, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.log('  Warning: index.html not found, using default home page');
    return createDefaultHomePage();
  }

  const html = fs.readFileSync(indexPath, 'utf8');

  // Extract title and meta description
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/);

  const title = titleMatch ? titleMatch[1] : 'MyAlarm Security - Home & Business Security Systems';
  const description = descMatch ? descMatch[1] : 'Professional security systems';

  return `---
header_text: "MyAlarm Security - Home & Business Security Systems"
meta_title: "${title}"
meta_description: "${description}"
permalink: "/"
layout: "home.html"
eleventyNavigation:
  key: Home
  order: 1
---

# Home
`;
};

/**
 * Create default home page if no source data available
 */
const createDefaultHomePage = () => `---
header_text: "MyAlarm Security - Home & Business Security Systems"
meta_title: "MyAlarm Security | Burglar Alarms & CCTV Systems"
meta_description: "Professional burglar alarm and CCTV installation across South East London and Kent."
permalink: "/"
layout: "home.html"
eleventyNavigation:
  key: Home
  order: 1
---

# Home
`;

/**
 * Generate products.md from product data
 */
const generateProductsPage = () => {
  const productsDir = path.join(config.OLD_SITE_PATH, 'products');

  if (!fs.existsSync(productsDir)) {
    console.log('  Warning: products directory not found, using default products page');
    return createDefaultProductsPage();
  }

  // Get list of products to build description
  const productFiles = fs.readdirSync(productsDir)
    .filter(f => f.endsWith('.php.html'));

  return `---
header_text: "Our Security Packages"
meta_title: "Security Packages | Burglar Alarms & CCTV | MyAlarm Security"
meta_description: "Browse our complete range of security packages: burglar alarms, CCTV systems, and combined packages. Professional installation across South East London and Kent."
permalink: "/products/"
layout: products
eleventyNavigation:
  key: Products
  order: 3
---

# Our Security Packages

We offer a comprehensive range of security packages designed to protect your home or business. All packages include professional installation, 12-month warranty, and ongoing support.

## Burglar Alarm Systems

**Basic System** - £539
Perfect for flats and smaller properties. Includes door contact, movement sensors, remote fobs, and external siren.

**Standard System** - £599
Enhanced protection with additional sensors and features for medium-sized homes.

**Pet Package** - £849
Specially designed for homes with pets, featuring pet-friendly movement sensors.

## CCTV Packages

**CCTV Package 1** - £999
Professional CCTV installation with high-quality cameras and recording system.

**CCTV Package 2** - £1,199
24-hour colour CCTV system with advanced night vision capabilities.

## Combined Packages

**Ultimate Package** - £1,549
Complete security solution combining burglar alarm and CCTV systems.

**Supreme Package** - £1,749
Our premium offering with 24-hour colour CCTV plus comprehensive intruder alarm system.

## Additional Services

**Servicing & Repairs**
Professional maintenance and repair services for existing security systems.

---

**Call us today on 020 8302 4065 for a free consultation and quote.**
`;
};

/**
 * Create default products page
 */
const createDefaultProductsPage = () => generateProductsPage();

/**
 * Generate service-areas.md from location pages
 */
const generateServiceAreasPage = () => {
  const pagesDir = path.join(config.OLD_SITE_PATH, 'pages');

  if (!fs.existsSync(pagesDir)) {
    console.log('  Warning: pages directory not found, using default service areas page');
    return createDefaultServiceAreasPage();
  }

  // Get list of location pages (excluding non-location pages)
  const excludePages = new Set([
    'about-us.php.html',
    'privacy-policy.php.html'
  ]);

  const locationFiles = fs.readdirSync(pagesDir)
    .filter(f => f.endsWith('.php.html') && !excludePages.has(f))
    .map(f => f.replace('.php.html', ''))
    .sort();

  // Group locations (basic grouping - can be enhanced)
  const londonKeywords = ['blackheath', 'bromley', 'catford', 'charlton', 'chislehurst',
    'eltham', 'greenwich', 'lee-green', 'new-eltham', 'sidcup', 'thamesmead',
    'welling', 'west-wickham', 'beckenham', 'bickley'];

  const london = locationFiles.filter(loc => londonKeywords.includes(loc));
  const kent = locationFiles.filter(loc => !londonKeywords.includes(loc));

  const formatLocation = (slug) => {
    const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `- **${name}** - Professional security installations`;
  };

  const londonList = london.map(formatLocation).join('\n');
  const kentList = kent.map(formatLocation).join('\n');

  return `---
header_text: "Service Areas"
meta_title: "Service Areas | Security Installation Across South East London & Kent"
meta_description: "We provide professional burglar alarm and CCTV installation across South East London and Kent including Bexley, Dartford, Bromley, Orpington, Greenwich and surrounding areas."
permalink: "/service-areas/"
layout: page
eleventyNavigation:
  key: Service Areas
  order: 4
---

# Service Areas

We provide professional security installation and maintenance services across South East London and Kent. Our experienced team covers the following areas:

## South East London

${londonList}

## Kent

${kentList}

## Why Choose MyAlarm Security?

- **Local Expertise** - Based in South East London with deep knowledge of the area
- **27+ Years Experience** - Extensive experience in the security industry
- **Professional Installation** - Fully qualified and certified engineers
- **Comprehensive Coverage** - Serving both residential and commercial properties
- **Ongoing Support** - Maintenance and repair services available

## Get Your Free Quote

Contact us today for a free, no-obligation quote for your security needs. We serve all areas listed above and many more across South East London and Kent.

**Call 020 8302 4065** or [contact us online](/contact/) to arrange your consultation.
`;
};

/**
 * Create default service areas page
 */
const createDefaultServiceAreasPage = () => `---
header_text: "Service Areas"
meta_title: "Service Areas | Security Installation Across South East London & Kent"
meta_description: "We provide professional burglar alarm and CCTV installation across South East London and Kent."
permalink: "/service-areas/"
layout: page
eleventyNavigation:
  key: Service Areas
  order: 4
---

# Service Areas

We provide professional security installation and maintenance services across South East London and Kent.
`;

/**
 * Generate not-found.md
 */
const generateNotFoundPage = () => `---
header_text: Not Found
meta_description:
meta_title: Not Found
no_index: true

permalink: /not_found.html
---

## Page Not Found

Whoops! It looks like you followed an invalid link - **[click here to go back to the homepage](/)**.
`;

/**
 * Generate thank-you.md
 */
const generateThankYouPage = () => `---
header_text: Thank You
meta_description:
meta_title: Thank You
navigationParent: Contact
no_index: true
---

## Thank You

Your message has been sent - we will be in touch.
`;

/**
 * Generate blog index page
 */
const generateBlogPage = () => `---
header_text: News
meta_description:
meta_title: News
permalink: /blog/
layout: blog
eleventyNavigation:
  key: News
  order: 2
---

# News
`;

/**
 * Generate reviews index page
 */
const generateReviewsPage = () => `---
header_text: Reviews
meta_description:
meta_title: Reviews
permalink: /reviews/
layout: reviews
---

# Reviews
`;

/**
 * Convert all special pages
 */
const convertSpecialPages = async () => {
  console.log('Generating special pages...');

  const outputDir = path.join(config.OUTPUT_BASE, config.paths.pages);
  ensureDir(outputDir);

  const pages = [
    { name: 'home.md', generator: generateHomePage },
    { name: 'products.md', generator: generateProductsPage },
    { name: 'service-areas.md', generator: generateServiceAreasPage },
    { name: 'not-found.md', generator: generateNotFoundPage },
    { name: 'thank-you.md', generator: generateThankYouPage },
    { name: 'blog.md', generator: generateBlogPage },
    { name: 'reviews.md', generator: generateReviewsPage }
  ];

  let successful = 0;
  let failed = 0;

  pages.forEach(({ name, generator }) => {
    try {
      const content = generator();
      const outputPath = path.join(outputDir, name);
      writeMarkdownFile(outputPath, content);
      console.log(`  ✓ Generated ${name}`);
      successful++;
    } catch (error) {
      console.error(`  ✗ Failed to generate ${name}: ${error.message}`);
      failed++;
    }
  });

  return {
    successful,
    failed,
    total: pages.length
  };
};

module.exports = {
  convertSpecialPages,
  generateHomePage,
  generateProductsPage,
  generateServiceAreasPage,
  generateNotFoundPage,
  generateThankYouPage,
  generateBlogPage,
  generateReviewsPage
};
