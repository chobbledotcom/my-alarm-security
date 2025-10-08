# Completed Tasks

## Home page
- Removed grey background from header text

## Tabs
- IN PROGRESS: https://www.terragonlabs.com/task/804de173-3070-498e-9b77-29508def95b8
- Added News and Reviews links to footer
- Centralised headings on 3 photos under roller banner

## About page
- Updated importer to skip images without alt text (icon images)
- Fixed pandoc shell path to work in NixOS environment
- Re-ran importer successfully with working pandoc

## Burglar Alarms page
- Created custom category layout to show products before content

## Package ordering
- Created constants.js file with PRODUCT_ORDER mapping
- Updated importer frontmatter generator to add order field to products (Basic=1, Standard=2, Pet=3, CCTV1=4, CCTV2=5, Ultimate=6, Supreme=7, Servicing=99)
- Re-ran importer successfully to apply order fields
- Added order field to products section in .pages.yml for CMS

## Links and Accessibility
- **NOTE**: Regarding hidden links in the text - we should have a conversation about accessibility and why visible/obvious links are beneficial for all users (including those using screen readers, those with cognitive disabilities, and for SEO). Hidden links can create a poor user experience as users don't know what's clickable. Clear link styling helps everyone navigate the site more effectively.
