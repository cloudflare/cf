/** @generated from cloudforce-one-get-rule-stats */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/stats`,
	errors: {
		401: "UnauthorizedError",
	},
} as const;
