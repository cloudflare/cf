/** @generated from queries.post */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/queries`,
	body: "json",
	errors: {
		401: "UnauthorizedError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
