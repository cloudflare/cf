/** @generated from cloudforce-one.rules.validate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/validate`,
	body: "json",
	errors: {
		401: "UnauthorizedError",
	},
} as const;
