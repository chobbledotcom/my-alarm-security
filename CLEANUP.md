---
permalink: false
---

# Agent SEO Cleanup Pass

Work an LLM/code agent can do now using the existing repo content. Assume every current service and every current location page matters: the goal is to improve the site toward ranking for all listed services in all listed towns.

Do not invent new business facts, new prices, new services, new towns, or new customer examples. The agent may use existing page copy, product copy, news posts and review files as source material.

## Source Material

Use these repo areas as evidence:

- `rankings.md` for tracked keyword positions, ranking URLs and current weak spots.
- `gsc/*.csv` for Search Console demand, impressions, CTR and page-level visibility.
- `gsc/coverage/*.csv` for index coverage summary.
- `locations/*.md` for the current town list and existing local copy.
- `categories/*.md` for service descriptions.
- `products/*.md` for packages, prices and product details.
- `news/*.md` for real job examples and local proof.
- `reviews/*.md` for customer quotes, ratings and dates.
- `_data/meta.json` and `_data/site.json` for business details.

Review files are especially useful. They usually contain `name`, `rating`, `date`, optional `source`/`categories`, and the review body. Quote short snippets from them where they support the page being edited.

## Ranking-Led Focus

Use both available data sources:

- `rankings.md` shows tracked SERP positions for known target terms.
- `gsc/*.csv` shows real Google impressions/clicks over the last 3 months.

The site is already performing well overall according to `rankings.md`:

- Average position: `4.4`.
- `277` tracked keywords in the top 3.
- `415` tracked keywords in the top 10.
- `458` tracked keywords in the top 30.
- `9` tracked keywords not ranked in the top 100.

So the work should be focused, not a broad rewrite of everything. Prioritise pages where tracked terms are outside the top 10, have dropped, or where the wrong URL is ranking.

Search Console shows a different but important demand pattern:

- `gsc/Queries.csv` has many high-impression commercial searches with 0 clicks and positions around 8-25.
- `gsc/Pages.csv` shows the homepage has by far the most impressions: `65,210` impressions, `198` clicks, `0.3%` CTR, average position `31.34`.
- Core category pages have lots of impressions but very low CTR/position:
  - `/categories/burglar-alarms/`: `12,083` impressions, `3` clicks, `0.02%` CTR, position `40.14`.
  - `/categories/servicing-and-repairs/`: `7,503` impressions, `8` clicks, `0.11%` CTR, position `39.4`.
  - `/categories/cctv/`: `6,331` impressions, `2` clicks, `0.03%` CTR, position `29`.
  - `/categories/special-offers/`: `4,088` impressions, `1` click, `0.02%` CTR, position `46.09`.
- `/categories/access-control/`: `2,581` impressions, `0` clicks, position `37.91`.

Search Console coverage also shows an indexing problem:

- Latest coverage snapshot in `gsc/coverage/Chart.csv`: `117` not indexed, `115` indexed.
- `gsc/coverage/Critical issues.csv` lists:
  - `90` pages: Crawled - currently not indexed.
  - `19` pages: Alternate page with proper canonical tag.
  - `3` pages: Page with redirect.
  - `2` pages: Excluded by `noindex` tag.
  - `1` page: Server error (5xx).
  - `1` page: Blocked by robots.txt.
- Local repo has roughly `270` content files and current `_site` has around `138` HTML files, so the indexed count is low enough to require triage.

This means the cleanup should improve both:

- ranking relevance for town/service pages; and
- search result appeal and query coverage for category/product pages.
- indexability and sitemap/canonical hygiene, especially for pages being strengthened.

### Technical First Priority: Indexing Triage

Before spending time rewriting many pages, confirm priority pages can be indexed.

Agent checks that can be done from the repo/build:

- Build the site and inspect `_site/sitemap.xml`.
- Confirm all priority category/product/location pages appear in the sitemap.
- Confirm priority pages render one canonical URL, and that it matches their public URL.
- Confirm priority pages are not marked `noindex`.
- Confirm `robots.txt` does not block priority sections.
- Confirm no priority URLs redirect unexpectedly.
- Check whether old `.php` URLs or historical paths are still appearing in GSC, e.g. `/categories/servicing-and-repairs.php`.

Priority pages for indexability checks:

- `/`
- `/categories/burglar-alarms/`
- `/categories/cctv/`
- `/categories/servicing-and-repairs/`
- `/categories/special-offers/`
- `/categories/access-control/`
- `/pages/dartford/`
- `/pages/bromley/`
- `/pages/greenwich/`
- `/pages/sevenoaks/`
- `/pages/thamesmead/`
- `/pages/bexley/`
- `/pages/bexleyheath/`
- `/pages/beckenham/`
- `/pages/orpington/`

If a priority page is missing from the sitemap, canonicalised away, blocked, `noindex`, or redirected, fix that before content edits.

The current coverage export does not include affected URLs. If URL-level coverage exports are later added, use them to prioritise `Crawled - currently not indexed` pages by business value and impressions.

### GSC First Priority: High-Impression Query Groups

Use these Search Console opportunities before alphabetic location work.

Broad installation queries:

- `burglar alarm installation` - `1,390` impressions, position `37.46`, `0` clicks.
- `burglar alarm installers` - `877` impressions, position `34.22`, `0` clicks.
- `burglar alarm installers near me` - `226` impressions, position `18.82`, `2` clicks.
- `burglar alarm installer` - `580` impressions, position `40.37`, `0` clicks.
- `burglar alarm installation near me` - `236` impressions, position `31.33`, `0` clicks.
- `alarm and cctv installation` - `285` impressions, position `27.13`, `0` clicks.
- `cctv and alarm installation` - `200` impressions, position `34.17`, `0` clicks.

Action:

- Strengthen `/categories/burglar-alarms/`, `/categories/cctv/`, `/categories/special-offers/`, and the relevant package pages around professional installation, fitted packages, surveys, app setup, tidy workmanship and included installation.
- Make titles/meta descriptions sound like install-service pages, not keyword lists.
- Add review proof about installation, tidiness and app setup.

Dartford opportunities:

- `burglar alarms dartford` - `727` impressions, position `18.83`, `0` clicks.
- `cctv installation dartford` - `663` impressions, position `18.92`, `0` clicks.
- `burglar alarm installation dartford` - `290` impressions, position `21.36`, `0` clicks.
- `cctv installers dartford` - `236` impressions, position `24.86`, `0` clicks.
- `cctv installer dartford` - `199` impressions, position `21.04`, `0` clicks.
- `home alarms dartford` - `199` impressions, position `11.42`, `0` clicks.
- `burglar alarm dartford` - `165` impressions, position `11.4`, `0` clicks.

Action:

- Prioritise `/pages/dartford/`.
- Add stronger burglar alarm, CCTV installation and servicing sections.
- Link to Dartford from `/categories/cctv/`, `/categories/burglar-alarms/`, `/categories/servicing-and-repairs/`, and relevant package pages.

Bromley opportunities:

- `cctv installation bromley` - `463` impressions, position `20.22`, `0` clicks.
- `burglar alarms bromley` - `416` impressions, position `20.22`, `0` clicks.
- `cctv installers bromley` - `401` impressions, position `20.92`, `0` clicks.
- `cctv systems bromley` - `338` impressions, position `15.9`, `0` clicks.
- `access control bromley` - `330` impressions, position `24.79`, `0` clicks.
- `intruder alarm bromley` - `307` impressions, position `12.76`, `0` clicks.
- `business security systems bromley` - `252` impressions, position `16.25`, `0` clicks.
- `cctv bromley` - `206` impressions, position `20.55`, `0` clicks.

Action:

- Prioritise `/pages/bromley/`.
- Bromley needs CCTV, burglar/intruder alarm, business security and access control coverage.
- Add internal links from CCTV, burglar alarms and access control categories.

Greenwich opportunities:

- `cctv installation greenwich` - `549` impressions, position `16.63`, `0` clicks.
- `burglar alarms greenwich` - `250` impressions, position `23.75`, `0` clicks.
- `burglar alarm installation greenwich` - `217` impressions, position `15.29`, `0` clicks.
- `alarm maintenance greenwich` - `223` impressions, position `5.88`, `0` clicks.
- `home security in greenwich` - `131` impressions, position `12.63`, `0` clicks.
- `business intruder alarm installation greenwich` - `122` impressions, position `10.52`, `0` clicks.
- `cctv systems greenwich` - `118` impressions, position `18.29`, `0` clicks.

Action:

- Prioritise `/pages/greenwich/`.
- Preserve/strengthen maintenance relevance, because it is already near top 5.
- Add stronger CCTV installation and burglar alarm installation sections.

Sevenoaks opportunities:

- `burglar alarms sevenoaks` - `366` impressions, position `23.1`, `0` clicks.
- `cctv sevenoaks` - `268` impressions, position `19.28`, `0` clicks.
- `cctv installation sevenoaks` - `253` impressions, position `24.7`, `0` clicks.
- `cctv systems sevenoaks` - `180` impressions, position `23.96`, `0` clicks.
- `burglar alarm sevenoaks` - `156` impressions, position `21.31`, `0` clicks.
- `home security sevenoaks` - `133` impressions, position `22.17`, `0` clicks.

Action:

- Prioritise `/pages/sevenoaks/`.
- SerpDino and GSC both show Sevenoaks weakness across CCTV, alarms, service and home security.

Bexley/Bexleyheath opportunities:

- `cctv installation bexley` - `338` impressions, position `8.52`, `0` clicks.
- `burglar alarms bexley` - `279` impressions, position `16.1`, `0` clicks.
- `security systems bexley` - `270` impressions, position `9.2`, `0` clicks.
- `home security bexley` - `164` impressions, position `4.2`, `0` clicks.
- `security camera systems in bexley` - `126` impressions, position `5.17`, `0` clicks.
- `cctv installation bexleyheath` - `185` impressions, position `17.04`, `0` clicks.

Action:

- Bexley has rankings close enough that CTR/meta and better snippets may matter.
- Prioritise `/pages/bexley/` and `/pages/bexleyheath/`, especially titles/meta and CCTV/security camera wording.

Access control:

- `access control bromley` - `330` impressions, position `24.79`, `0` clicks.
- `door entry systems orpington` - `131` impressions, position `11.5`, `0` clicks.

Action:

- Strengthen `/categories/access-control/`.
- Add access-control sections or internal links on Bromley and Orpington pages if naturally supported by existing copy.

### First Priority: CCTV Location Terms

CCTV is the weakest service cluster in the SerpDino tracker. Start here alongside the GSC high-impression work above.

High-priority tracked gaps:

- `cctv greenwich` - position `35`, ranking `/categories/cctv/`.
- `cctv bromley` - position `28`, ranking homepage.
- `cctv beckenham` - position `26`, ranking `/pages/beckenham/`.
- `cctv thamesmead` - position `26`, ranking `/categories/cctv/`.
- `cctv shoreham` - position `26`, ranking `/pages/shoreham/`.
- `cctv sevenoaks` - position `25`, ranking `/pages/sevenoaks/`.
- `cctv dartford` - position `24`, ranking `/categories/cctv/`.
- `cctv bexley` - position `23`, ranking `/categories/cctv/`.
- `cctv charlton` - position `19`, ranking `/pages/charlton/`.
- `cctv bexleyheath` - position `18`, ranking `/pages/bexleyheath/`.
- `cctv bickley` - position `16`, ranking homepage.
- `cctv catford` - position `14`, ranking `/pages/catford/`.
- `cctv orpington` - position `12`, ranking homepage.
- `cctv blackheath` - position `12`, ranking `/pages/blackheath/`.
- `cctv swanley` - position `12`, ranking `/pages/swanley/`.
- `cctv gravesend` - position `11`, ranking `/pages/gravesend/`.

For these pages, strengthen the town page's CCTV section, link from `/categories/cctv/`, link from relevant CCTV product pages, add review snippets about CCTV/tidy work, and link relevant CCTV news posts where they exist.

Where the homepage or `/categories/cctv/` is ranking for a town query, treat that as a sign the town page needs stronger internal links and clearer CCTV copy.

### Second Priority: Sevenoaks And Thamesmead Alarm Terms

These two locations have several tracked alarm/home-security terms underperforming or ranking the wrong URL.

Sevenoaks gaps:

- `burglar alarm sevenoaks` - position `26`, ranking `/pages/sevenoaks/`.
- `burglar alarms sevenoaks` - position `23`, ranking `/categories/burglar-alarms/`.
- `burglar alarm system sevenoaks` - position `22`, ranking `/categories/burglar-alarms/`.
- `home security sevenoaks` - position `22`, ranking `/pages/sevenoaks/`.
- `house alarm service sevenoaks` - position `20`, ranking `/categories/burglar-alarms/`.
- `burglar alarm service sevenoaks` - position `19`, ranking homepage.
- `burglar alarm engineer sevenoaks` - position `18`, ranking `/categories/burglar-alarms/`.
- `burglar alarm maintenance sevenoaks` - position `15`, ranking `/categories/burglar-alarms/`.

Thamesmead gaps:

- `burglar alarm engineer thamesmead` - position `29`, ranking `/categories/burglar-alarms/`.
- `home security thamesmead` - position `21`, ranking an Eltham blog post.
- `burglar alarms thamesmead` - position `18`, ranking `/categories/burglar-alarms/`.
- `burglar alarm thamesmead` - position `17`, ranking `/categories/burglar-alarms/`.
- `house alarm thamesmead` - position `13`, ranking `/categories/burglar-alarms/`.
- `house alarm service thamesmead` - position `13`, ranking `/categories/burglar-alarms/`.
- `burglar alarm service thamesmead` - position `11`, ranking homepage.

For these, make the location pages clearly cover alarm installation, engineer/service/maintenance, battery replacement and home security. Add internal links from burglar alarm, servicing and relevant product pages to the location pages.

Search Console confirms Sevenoaks as high-impression work. Thamesmead is a SerpDino priority but lower in GSC demand; still fix it because wrong URLs are ranking.

### Third Priority: Other Page-Two Location Clusters

After CCTV, Sevenoaks and Thamesmead, work on clusters where several terms are near page one:

- Beckenham: `burglar alarms beckenham`, `burglar alarm beckenham`, `home security beckenham`, `house alarm beckenham`, plus weak CCTV.
- Gravesend: `cctv gravesend`, `burglar alarm gravesend`, `burglar alarm system gravesend`, `house alarm gravesend`, `home security gravesend`.
- Bromley: `burglar alarm bromley`, `home security bromley`, `burglar alarm system bromley`, plus weak CCTV.
- Hayes: `burglar alarms hayes`, `burglar alarm hayes`, `house alarm hayes`, plus CCTV already in the top 10 but not top 3.
- Erith: `home security erith`, `burglar alarm battery erith`.
- Welling: `burglar alarm engineer welling`.

GSC adds these priority clusters:

- Dartford: high impressions across burglar alarms and CCTV installation.
- Bromley: high impressions across CCTV, alarms, business security and access control.
- Greenwich: high impressions across CCTV, alarm installation and maintenance.
- Bexley/Bexleyheath: several terms are already close enough that metadata/CTR improvements may help.

### Wrong-URL Fixes

When a town-specific query ranks the homepage, a category page, or an unrelated blog post, add links and copy so Google has a better town page to choose.

Examples from `rankings.md`:

- `cctv bromley`, `cctv bickley`, `cctv orpington` rank the homepage.
- `cctv greenwich`, `cctv dartford`, `cctv bexley`, `cctv thamesmead` rank `/categories/cctv/`.
- `home security thamesmead` ranks an Eltham blog post.
- Several Sevenoaks alarm terms rank `/categories/burglar-alarms/` or homepage instead of `/pages/sevenoaks/`.

Do not remove useful homepage/category relevance. Add stronger internal routes to the intended town pages.

## Target Services

Treat all current service/category pages as SEO targets:

- Burglar alarms
- CCTV
- Servicing and repairs
- Special offer alarm/CCTV packages
- Access control and door entry
- Alarm batteries
- Alarm service and maintenance
- Individual alarm/CCTV package pages

## Target Towns

Treat every existing `locations/*.md` page as a target:

- Badgers Mount
- Barnehurst
- Beckenham
- Belvedere
- Bexley
- Bexleyheath
- Bickley
- Blackheath
- Bromley
- Catford
- Charlton
- Chelsfield
- Chislehurst
- Crayford
- Dartford
- Ebbsfleet
- Eltham
- Erith
- Eynsford
- Gravesend
- Greenhithe
- Greenwich
- Hayes
- Hextable
- Keston
- Lee Green
- Longfield
- Meopham
- New Ash Green
- New Eltham
- Orpington
- Petts Wood
- Sevenoaks
- Shoreham
- Shorne
- Sidcup
- Swanley
- Swanscombe
- Thamesmead
- Welling
- West Kingsdown
- West Wickham
- Wilmington

Execution order should follow the ranking-led focus above, not this alphabetical list.

## 1. Rewrite Over-Stuffed Metadata

Rewrite `meta_title` and `meta_description` fields so they read like normal search results rather than stacked keyword lists.

Rules:

- Use one primary phrase per page.
- Mention the location naturally on location pages.
- Mention the service naturally on category/product pages.
- Keep titles roughly under 60 characters where possible.
- Keep descriptions roughly under 150-160 characters.
- Avoid repeated town lists unless the page is the service-area index.
- Do not stuff variants like "alarm system, burglar alarm, home alarm, alarm company near me" into one field.

Example direction:

```yaml
meta_title: Burglar Alarms & CCTV in Sidcup and Bexley
meta_description: Family-run burglar alarm and CCTV installers based near Sidcup, covering Bexley, Eltham, Orpington and nearby areas.
```

GSC-specific title/meta priority:

- Homepage: improve CTR for broad commercial impressions without stuffing every town.
- `/categories/burglar-alarms/`: target burglar alarm installation/installers and fitted alarm systems.
- `/categories/cctv/`: target CCTV installation, CCTV installers and fitted CCTV systems.
- `/categories/servicing-and-repairs/`: target alarm service, maintenance, repair and battery replacement.
- `/categories/access-control/`: target access control and door entry systems.
- Priority town pages: Dartford, Bromley, Greenwich, Sevenoaks, Bexley, Bexleyheath, Beckenham, Orpington.

## 2. Fix Obvious Copy Issues

Run a targeted proofread on pages, categories, products, locations and recent/high-value news posts. Keep the owner's plain tone, but fix clear spelling, grammar and typo issues.

Known searches:

- `inlcuding`
- `nowdays`
- `profesioinal`
- `survery`
- `horrifed`
- `seurity`
- `gon eon`
- `couldnt`
- `didnt`
- `was called`
- `We was`
- `We recently was`

Do not over-polish every sentence. The goal is credibility, not agency copy.

## 3. Improve Location Pages Using Existing Evidence

The location pages already exist, but many are similar. Improve them using existing repo evidence.

Execution priority from GSC and SerpDino:

1. Dartford
2. Bromley
3. Greenwich
4. Sevenoaks
5. Bexley
6. Bexleyheath
7. Beckenham
8. Orpington
9. Thamesmead
10. Gravesend

Each location page should aim to include:

- One clear H1, e.g. `Burglar Alarms and CCTV in Eltham`.
- A short intro saying MyAlarm is based near Sidcup/New Eltham and covers that town.
- Separate sections where useful:
  - burglar alarm installation
  - alarm servicing, faults and battery replacement
  - CCTV installation
  - access control, if the page already mentions it or the service naturally fits
- Links to relevant service/category pages.
- Links to relevant product/package pages where useful.
- Short review snippets chosen from `reviews/*.md`.
- Links to relevant job/news posts where that town or service is already mentioned.
- A clear CTA with phone/email/contact page.

For ranking-led priority pages, also add a small "Related services in [town]" or equivalent section with natural links to:

- `/categories/cctv/`
- `/categories/burglar-alarms/`
- `/categories/servicing-and-repairs/`
- relevant product/package pages

Keep this as useful navigation, not a block of repeated keywords.

Allowed evidence:

- Existing location copy.
- Existing service/category copy.
- Existing product/package copy.
- Existing news posts mentioning that town or nearby service.
- Existing review snippets about reliability, tidiness, professionalism, alarm work, CCTV work, servicing, repairs or app setup.

Avoid:

- Inventing jobs, local landmarks, roads or customer details.
- Copying the same paragraph with only the town changed.
- Long lists of every nearby town on every page.
- Keywordy anchor text repeated unnaturally.

## 4. Use Reviews As Proof

Add short, relevant review snippets where they help the page. Prefer recent Google reviews when available, but Checkatrade reviews can also support older work.

Rules:

- Keep quotes short.
- Attribute by reviewer name and source/date where available.
- Match quote to topic where possible: CCTV page gets CCTV-related reviews, servicing page gets repair/service reviews, location page gets town-specific reviews if available.
- If no town-specific review exists, use a general review about workmanship, tidiness, helpfulness or reliability.
- Do not claim a review is from a town unless the review file or body says so.

Example source files already present:

- `reviews/ambrose-woo-google-2026-03-31.md` mentions removal of an existing alarm, new alarm installation, app setup and tidying up.
- `reviews/bromley-borough-google-2026-04-07.md` mentions Texecom alarm, Hikvision CCTV, building work damage, repair, cabling and tidy work.
- `reviews/lisa-ryan-google-2026-04-28.md` gives a short long-term customer recommendation.

## 5. Link Existing News Posts To Existing Pages

Add natural internal links where the existing post already mentions the relevant location/service.

Good candidates:

- `news/2026-05-13-burglar-alarm-and-cctv-upgrade-in-eltham-se9.md`
- `news/2026-02-19-alarm-system-service-maintenance-in-orpington.md`
- `news/2026-01-30-home-alarm-system-in-eltham-london-se9.md`
- `news/2025-12-03-alarm-system-upgrade-and-new-siren-in-belvedere.md`
- `news/2025-10-23-home-security-system-sidcup.md`
- `news/2025-10-23-home-burglar-alarm-system-on-a-bungalow-in-sidcup.md`
- `news/2024-05-30-petts-wood-alarm-system-upgrade-and-cctv-package.md`

Useful links:

- news post -> existing location page
- news post -> relevant category page
- news post -> relevant product/package page
- location page -> relevant news post
- category/product page -> relevant news post

For CCTV priority pages, search older news posts too, not just the recent list. Good search terms include `CCTV`, `ColorVu`, `Hik`, `Hikvision`, `camera`, `cabling`, `DIY CCTV`, and the town name.

## 6. Fix Internal Link Problems

Search for old, absolute, unclear or incorrect internal links.

Checks:

- Links to location pages should use existing `/pages/<location>/` URLs.
- Fix obvious category mismatches where the surrounding copy proves the intended target, e.g. CCTV text linking to burglar alarms.
- Prefer site-relative links over absolute `https://www.myalarmsecurity.co.uk/...` links for internal pages.
- Replace `click here` style anchors with descriptive link text where the target is clear.
- Make sure contact CTAs point to `/contact/`.

Also check internal links from the homepage and category pages to the ranking-priority location pages. If a tracked town query currently ranks the homepage/category page, the intended town page should get a clear contextual link from that stronger page.

## 7. Product And Package Naming

Use the current product bodies as the source of truth for names and prices. The filenames may be historical.

Known checks:

- `products/cctv-package-1-999.md` content says `CCTV Package 2`, price `£1,999.00`, 4K/8MP, 2-way audio.
- `products/cctv-package-2-1199-24hr-colour-cctv.md` content says `CCTV Package 1`, price `£1,399.00`, 5MP/3K, built-in microphone.
- `products/supreme-package-24hr-colour-cctv-plus-intruder-alarm-system-1749.md` content says `Ultimate Package`, price `£1,948.00`, Standard Alarm + CCTV Package 1.
- `products/ultimate-package-cctv-intruder-alarm-system-1549.md` content says `Supreme Package`, price `£2,548.00`, Standard Alarm + CCTV Package 2.

Agent action:

- Make visible titles, metadata and internal references consistent with the product body.
- Do not change URLs/permalinks unless redirects are implemented.
- If uncertain, leave a note rather than guessing.

## 8. Add Structured Data

If the template does not already handle this, add JSON-LD using existing data only.

Recommended:

- `LocalBusiness` using `_data/meta.json` and `_data/site.json`.
- `FAQPage` on `pages/faq.md` if the layout supports page-specific schema cleanly.
- `Product` or `Service` schema for product/package pages if supported cleanly by the template.
- Breadcrumb schema only if it can be generated from existing navigation/page data.

Use existing data where possible:

- business name
- URL
- address
- phone number
- service areas
- social/profile links
- product/package names and prices
- review data only if schema can be generated honestly and policy-compliantly from the review collection

Do not add opening hours or claims that are not already present in the repo.

GSC shows `Product snippets` have `5,213` impressions but only `2` clicks, `0.04%` CTR and position `42.39`. Product/package schema and clearer product metadata are worthwhile, but only if generated cleanly from existing product fields.

## 9. Improve Image Alt Text

Prioritise recent job posts and main service/category imagery.

Rules:

- Describe what is actually shown when the filename/context makes it clear.
- Include the place only when it is already in the post/page context.
- Avoid keyword stuffing.
- Replace generic alt text like `Banner 1` only when a better description is supported by the image filename/page context.

Example:

```text
Hikvision CCTV camera installed on an Eltham house after a DIY system upgrade
```

## 10. Build And Check

After edits:

- Run the repo build/test command.
- Check for broken internal links if tooling supports it.
- Check `_site/sitemap.xml` includes priority pages.
- Check priority pages are indexable: no unwanted `noindex`, no robots block, no wrong canonical, no unexpected redirect.
- Spot-check the rendered homepage, core category pages, FAQ, reviews, products, and edited location/news pages.
- Confirm metadata renders in final HTML.
- Confirm structured data is valid JSON-LD.

## Done Criteria

- Metadata is human-readable and not keyword-stuffed.
- GSC high-impression, low-click query groups have been addressed in copy, metadata and internal links.
- Priority pages are confirmed indexable and present in the sitemap.
- Clear spelling and grammar issues are fixed.
- Ranking-priority CCTV pages are strengthened first.
- Sevenoaks and Thamesmead alarm clusters have clearer location-page targeting.
- Wrong-URL rankings have been addressed with copy and internal links.
- Every current service and location has a clearer path to rank after the priority work.
- Review snippets are used where they add real proof.
- Existing job posts have sensible links to relevant existing pages.
- Obvious incorrect internal links are fixed.
- Product/package naming is consistent with current product content.
- Structured data exists or a note explains why it was deferred.
- Build passes.
