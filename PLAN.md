---
permalink: false
---

# SEO Plan Requiring Access Or External Input

Assumption for this project: every existing service and every existing town is worth targeting. Treat all services and locations as equally profitable unless MyAlarm later says otherwise.

Most content work can be done from the repo now. This file only lists work that needs access outside the repo or genuinely new business input.

## 1. Google Business Profile Work

This needs access to MyAlarm's Google Business Profile.

Tasks for MyAlarm or someone with access:

- Confirm the primary and secondary business categories.
- Fill out all current services: burglar alarm installation, alarm servicing, alarm battery replacement, CCTV installation, access control and package work.
- Add current job photos.
- Add posts/updates from strong job posts.
- Reply to reviews.
- Ask customers for new Google reviews after completed jobs.
- Check name, address and phone match the website exactly.

## 2. Opening Hours And Emergency Availability

The repo has phone/address/service details, but opening hours and emergency availability should not be guessed.

Ask MyAlarm:

- Normal office/contact hours.
- Whether out-of-hours emergency callouts should be advertised.
- How to word emergency availability without overpromising.
- Whether any callout surcharge should be mentioned.

Use this for:

- website copy
- schema
- Google Business Profile
- FAQ

## 3. Certifications, Insurance And Trust Claims

Some trust claims exist in the repo, such as DBS checks, public liability insurance and experience. Any stronger or more formal claims should be confirmed before adding.

Ask MyAlarm:

- Current DBS wording.
- Current public liability insurance wording.
- Any certifications/accreditations that should be named.
- Whether certificates can be shown or offered on request.

## 4. New Job Post Inputs

Future news posts should come from real jobs. MyAlarm should provide enough detail for each new post.

Useful job post notes:

- Town/postcode area.
- What the customer needed.
- What was wrong with the old system, if relevant.
- Equipment installed or serviced.
- Any neat/tidy/problem-solving detail.
- Photos before and after.
- Whether the customer was happy to have the job described anonymously.

Good post types:

- Alarm service after low battery fault.
- Old alarm upgraded to Pyronix.
- DIY CCTV replaced with Hikvision.
- Alarm repair after decorating/flooring/building work.
- Siren replacement where the finish was kept tidy.
- CCTV upgrade with cleaner cabling.

## 5. New Photos

The repo contains existing images, but better SEO/location pages will benefit from ongoing fresh job photos.

Ask MyAlarm for:

- Before/after siren replacements.
- Neat CCTV cable runs.
- App-controlled alarm panels.
- CCTV camera positions.
- Battery/service visits.
- Access control/door entry installs.

Photos should be attached to the relevant product, service, town and job-post pages.

## 6. Search Console And Performance Data

Initial Google Search Console exports are now in `gsc/`.

The repo now has `rankings.md`, a SerpDino export with 467 tracked keywords. Use that as the working prioritisation source until Search Console data is available.

Use `gsc/Queries.csv` and `gsc/Pages.csv` alongside `rankings.md`. GSC gives demand/impression data; SerpDino gives tracked ranking positions.

Current GSC notes from the last 3 months:

- UK dominates impressions, so no country targeting issue is apparent.
- Homepage has `65,210` impressions and `198` clicks.
- Desktop has many impressions but very low CTR, so metadata/snippet quality matters.
- Category pages have large impression counts and very low CTR.
- Product snippets show `5,213` impressions but only `2` clicks.

Useful checks:

- Queries already generating impressions.
- Pages with impressions but low click-through rate.
- Town/service combinations already close to ranking well.
- Pages with no impressions after being indexed.
- Form/phone enquiry tracking if available.
- Confirmation of the 9 tracked keywords currently not ranked in the top 100, if they are not visible in the export table.

Remaining external data that would help:

- Query exports filtered by priority pages, especially `/pages/dartford/`, `/pages/bromley/`, `/pages/greenwich/`, `/pages/sevenoaks/`, `/categories/cctv/`, `/categories/burglar-alarms/`, `/categories/servicing-and-repairs/`, and `/categories/access-control/`.
- Search Console URL inspection/indexing status for pages with high SerpDino opportunity but weak GSC clicks.
- Actual phone/form enquiry tracking, if available.

If no more data is available, proceed with `gsc/` plus `rankings.md`.

## 7. URL-Level Index Coverage

Coverage summary exports are now in `gsc/coverage/`, but they do not include the affected URLs.

Current summary:

- Latest snapshot: `117` not indexed, `115` indexed.
- `90` pages are `Crawled - currently not indexed`.
- `19` pages are alternate pages with canonical tags.
- `3` pages are redirects.
- `2` pages are excluded by `noindex`.
- `1` page has a server error.
- `1` page is blocked by robots.txt.

Useful next export/input:

- Export affected URLs for each coverage reason, especially `Crawled - currently not indexed`.
- Run URL Inspection for priority pages if they are not getting impressions.
- Confirm whether the `Server error (5xx)` and `Blocked by robots.txt` URLs are important pages.
- Confirm whether the alternate canonical URLs are expected duplicates or accidental canonical problems.

Priority URL inspection list:

- `/categories/burglar-alarms/`
- `/categories/cctv/`
- `/categories/servicing-and-repairs/`
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
