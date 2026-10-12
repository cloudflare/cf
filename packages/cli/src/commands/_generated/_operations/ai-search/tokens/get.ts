/** @generated from ai-search-fetch-tokens */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/tokens/${request.id}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
