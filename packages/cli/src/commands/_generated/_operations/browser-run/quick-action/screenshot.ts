/** @generated from brapi-post_Screenshot */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/screenshot`,
	query: ["cacheTTL", "browser"],
	body: "json",
	errors: {
		400: "BadRequestError",
		422: "UnprocessableEntityError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
