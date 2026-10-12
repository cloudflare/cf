/** @generated from cloudforce-one-list-email-rules */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/structured`,
	query: ["limit", "offset", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
