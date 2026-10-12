/** @generated from logo-matches.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/brand-protection/logo-matches`,
	query: ["logo_id", "offset", "limit"],
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
