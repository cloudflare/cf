/** @generated from ai-search.tokens.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/tokens`,
	query: ["page", "per_page", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
