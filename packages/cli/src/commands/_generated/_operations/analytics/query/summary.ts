/** @generated from analytics.query.summary */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/analytics/query/${request.dataset}/summary`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
