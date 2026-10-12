/** @generated from builds.tokens.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/tokens`,
	query: ["page", "per_page"],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
