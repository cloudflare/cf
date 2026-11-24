/** @generated from o11y.destinations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/destinations/${request.slug}`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
