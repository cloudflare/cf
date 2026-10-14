/** @generated from o11y.queries.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/queries`,
	query: ["page", "perPage", "order", "orderBy"],
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
