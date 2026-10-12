/** @generated from issues.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/issues`,
	query: [
		"page",
		"perPage",
		"order",
		"orderBy",
		"search",
		"service",
		"type",
		"status",
	],
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
