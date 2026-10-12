/** @generated from queries.patch */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/queries/${request.queryId}`,
	body: "json",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
