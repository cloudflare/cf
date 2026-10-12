/** @generated from destinations.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/destinations/${request.slug}`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
