/** @generated from brapi-post_Pdf */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/pdf`,
	query: ["cacheTTL", "browser"],
	body: "json",
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		422: "UnprocessableEntityError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
