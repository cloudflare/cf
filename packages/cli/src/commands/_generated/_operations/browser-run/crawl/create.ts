/** @generated from browser-run.crawl.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/browser-rendering/crawl",
	query: ["cacheTTL"],
	body: "json",
	errors: {
		400: "BadRequestError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
