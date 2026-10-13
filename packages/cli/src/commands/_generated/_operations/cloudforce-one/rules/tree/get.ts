/** @generated from cloudforce-one.rules.tree.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/tree`,
	errors: {
		401: "UnauthorizedError",
	},
} as const;
