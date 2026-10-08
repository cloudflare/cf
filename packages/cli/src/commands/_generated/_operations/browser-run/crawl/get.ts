/** @generated from browser-run.crawl.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/browser-rendering/crawl/{job_id}",
	query: ["cacheTTL", "status", "cursor", "limit"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
