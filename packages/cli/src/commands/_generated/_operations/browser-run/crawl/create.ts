/** @generated from brapi-post_Crawl */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/crawl`,
	query: ["cacheTTL"],
	body: "json",
	errors: {
		400: "BadRequestError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
