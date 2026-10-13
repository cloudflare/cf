/** @generated from cloudforce-one.rules.delete-all */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules`,
	errors: {
		401: "UnauthorizedError",
		409: "ConflictError",
	},
} as const;
