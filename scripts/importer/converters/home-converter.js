const fs = require('fs');
const path = require('path');

/**
 * Extract homepage content from the old site index.html using regex
 * @returns {Object} Conversion results
 */
const convertHomeContent = () => {
  console.log('Converting homepage content...');

  const oldSitePath = path.join(__dirname, '../../../old_site/www.myalarmsecurity.co.uk/index.html');
  const outputPath = path.join(__dirname, '../../../_data/home_content.json');

  try {
    const html = fs.readFileSync(oldSitePath, 'utf-8');

    const homeContent = {
      hero: {
        service_cards: []
      },
      main_content: {
        paragraphs: [],
        highlight: ""
      },
      why_choose_us: {
        heading: "Why Choose Us?",
        features: []
      },
      reviews: {
        heading: "Our Reviews",
        items: []
      }
    };

    // Extract service cards section with images
    const serviceCardPattern = /<div class="col-xl-4[^>]*>[\s\S]*?<img src="([^"]+)"[^>]*>[\s\S]*?<h3[^>]*style="color:[^"]*">([^<]+)<\/h3>[\s\S]*?<p class="card-text py-2">([^<]+)<\/p>[\s\S]*?<a href="([^"]+)"[^>]*>More Info<\/a>/g;
    let cardMatch;
    while ((cardMatch = serviceCardPattern.exec(html)) !== null) {
      homeContent.hero.service_cards.push({
        title: cardMatch[2].trim(),
        description: cardMatch[3].trim(),
        link: cardMatch[4].replace('.php.html', ''),
        image: cardMatch[1].trim()
      });
    }

    // Extract main content paragraphs
    const homePageSection = html.match(/<section class="home-page">([\s\S]*?)<\/section>/);
    if (homePageSection) {
      const sectionContent = homePageSection[1];
      const firstColumn = sectionContent.match(/<div id="column_NQZ91"[^>]*>([\s\S]*?)<\/div>\s*<div id="column_EOJ8N"/);

      if (firstColumn) {
        const paragraphPattern = /<p class="ql-align-justify">([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*?)<\/p>/g;
        let pMatch;
        while ((pMatch = paragraphPattern.exec(firstColumn[1])) !== null) {
          const text = pMatch[1].replace(/<[^>]+>/g, '').replace(/&apos;/g, "'").trim();
          if (!text.includes('DBS checked')) {
            homeContent.main_content.paragraphs.push(text);
          }
        }

        // Extract DBS highlight
        const highlightMatch = firstColumn[1].match(/<strong[^>]*style="color:[^"]*">([^<]+)<\/strong>/);
        if (highlightMatch) {
          homeContent.main_content.highlight = highlightMatch[1].trim();
        }
      }
    }

    // Extract "Why Choose Us" features with icon mapping
    const featurePattern = /<div class="text-center[^>]*><strong>([^<]+)<\/strong><\/div>/g;
    let featureMatch;
    let featureIndex = 0;
    const iconMap = [
      "/assets/icons/fully-certified-engineers.svg",
      "/assets/icons/24-7-service.svg",
      "/assets/icons/shield.svg",
      "/assets/icons/tools.svg"
    ];
    while ((featureMatch = featurePattern.exec(html)) !== null) {
      const title = featureMatch[1].trim();
      if (title && !title.includes('Our Service Areas')) {
        const feature = { title };
        if (featureIndex < iconMap.length) {
          feature.icon = iconMap[featureIndex];
        }
        homeContent.why_choose_us.features.push(feature);
        featureIndex++;
      }
    }

    // Extract reviews
    const reviewPattern = /<div class="card text-white bg-dark">[\s\S]*?<p class="card-text mb-0">([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*?)<\/p>[\s\S]*?<p class="card-text mt-3"><strong>([^<]+)<\/strong>\s+([^<]+)<\/p>/g;
    let reviewMatch;
    while ((reviewMatch = reviewPattern.exec(html)) !== null) {
      homeContent.reviews.items.push({
        text: reviewMatch[1].replace(/<[^>]+>/g, '').replace(/&apos;/g, "'").trim(),
        author: reviewMatch[2].trim(),
        date: reviewMatch[3].trim()
      });
    }

    // Write the JSON file
    fs.writeFileSync(outputPath, JSON.stringify(homeContent, null, 2));

    console.log('✅ Homepage content extracted successfully');
    console.log(`   - ${homeContent.hero.service_cards.length} service cards`);
    console.log(`   - ${homeContent.main_content.paragraphs.length} content paragraphs`);
    console.log(`   - ${homeContent.why_choose_us.features.length} features`);
    console.log(`   - ${homeContent.reviews.items.length} reviews`);

    return {
      successful: 1,
      failed: 0,
      total: 1
    };
  } catch (error) {
    console.error('❌ Error converting homepage content:', error.message);
    return {
      successful: 0,
      failed: 1,
      total: 1
    };
  }
};

module.exports = { convertHomeContent };
