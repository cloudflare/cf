/** @generated from cloudforce-one-get-rule */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/${request.id}`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
