/** @generated from cloudforce-one.rules.search */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/search`,
	query: [
		"namespace",
		"path",
		"recursive",
		"search",
		"is_public",
		"limit",
		"offset",
		"query",
		"mode",
		"language",
	],
	errors: {
		401: "UnauthorizedError",
		503: "ServiceUnavailableError",
	},
} as const;
