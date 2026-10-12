/** @generated from ai-search-create-tokens */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/tokens`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
