/** @generated from cloudforce-one-get-managed-rules */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/managed`,
	errors: {
		401: "UnauthorizedError",
	},
} as const;
