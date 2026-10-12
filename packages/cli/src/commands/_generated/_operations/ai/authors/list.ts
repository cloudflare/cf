/** @generated from ai.authors.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/authors/search`,
	errors: {
		400: "BadRequestError",
	},
} as const;
