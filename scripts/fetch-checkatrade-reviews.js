#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");

// Configuration
const CONFIG = {
	companyId: "427092",
	reviewsDir: path.join(__dirname, "..", "reviews"),
	pageSize: 25,
};

function formatFilename(id, date) {
	// Use the last part of the UUID as identifier (reviews are anonymous on Checkatrade)
	const shortId = (id || "unknown").split("-").pop().substring(0, 12);
	const safeDate =
		date instanceof Date && !isNaN(date)
			? date.toISOString().split("T")[0]
			: new Date().toISOString().split("T")[0];
	return `checkatrade-${safeDate}-${shortId}.md`;
}

function makeApiRequest(url) {
	return new Promise((resolve, reject) => {
		const request = https.get(url, (response) => {
			let data = "";
			response.on("data", (chunk) => (data += chunk));
			response.on("end", () => {
				if (response.statusCode >= 400) {
					reject(new Error(`HTTP ${response.statusCode}: ${data}`));
				} else {
					resolve(JSON.parse(data));
				}
			});
		});

		request.on("error", reject);
		request.setTimeout(30000, () => {
			request.destroy();
			reject(new Error("Request timeout"));
		});
	});
}

async function fetchAllReviews() {
	const baseUrl = `https://api.checkatrade.com/v1/consumer-public/reviews/${CONFIG.companyId}`;
	let page = 1;
	let allReviews = [];

	console.log(
		`Fetching reviews from Checkatrade API for company ID ${CONFIG.companyId}...`,
	);

	// First request to get total count
	const firstResponse = await makeApiRequest(
		`${baseUrl}?size=${CONFIG.pageSize}&page=${page}&orderDesc=createdAt`,
	);
	const totalReviews = firstResponse.total;
	const totalPages = Math.ceil(totalReviews / CONFIG.pageSize);

	console.log(`Total reviews available: ${totalReviews}`);

	allReviews = allReviews.concat(firstResponse.data || []);

	// Fetch remaining pages
	while (page < totalPages) {
		page++;
		console.log(`Fetching page ${page} of ${totalPages}...`);

		const response = await makeApiRequest(
			`${baseUrl}?size=${CONFIG.pageSize}&page=${page}&orderDesc=createdAt`,
		);
		allReviews = allReviews.concat(response.data || []);

		// Small delay to avoid rate limits
		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	return allReviews;
}

function saveReview(review, outputDir) {
	// Extract review fields
	const id = review.id || "";
	const reviewText = review.review || "";
	const title = review.title || "";
	const createdAt = review.createdAt ? new Date(review.createdAt) : new Date();
	const rating10 = review.rating?.rating || 10;
	const postcode = review.location?.postcode || "";

	// Skip if no review text
	if (!reviewText || reviewText.length < 5) {
		return false;
	}

	// Replace placeholder text with empty string
	const finalReviewText = reviewText.toLowerCase().includes("no comments given")
		? ""
		: reviewText;

	const filename = formatFilename(id, createdAt);
	const filepath = path.join(outputDir, filename);

	// Skip if file already exists
	if (fs.existsSync(filepath)) {
		return false;
	}

	// Convert rating from 1-10 scale to 1-5 scale
	const rating5 = Math.min(5, Math.max(1, Math.round(rating10 / 2)));

	// Use postcode area as a pseudo-name (e.g., "BR1" -> "Checkatrade customer from BR1")
	const displayName = postcode
		? `Checkatrade customer from ${postcode}`
		: "Checkatrade customer";

	const content = `---
name: ${displayName}
source: checkatrade
rating: ${rating5}
---

${finalReviewText}
`;

	fs.writeFileSync(filepath, content);
	console.log(`Created: ${filename} (${rating10}/10 stars)`);
	return true;
}

async function main() {
	// Ensure output directory exists
	fs.mkdirSync(CONFIG.reviewsDir, { recursive: true });

	try {
		const reviews = await fetchAllReviews();
		console.log(`Found ${reviews.length} reviews`);

		let saved = 0;
		for (const review of reviews) {
			if (saveReview(review, CONFIG.reviewsDir)) {
				saved++;
			}
		}

		console.log(`\nCheckatrade review fetch complete!`);
		console.log(`New reviews saved: ${saved}`);
		console.log(`Already existed (skipped): ${reviews.length - saved}`);
	} catch (error) {
		console.error("Error:", error.message);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
