/** @generated from billing.usage.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billing/usage`,
	query: ["metrics", "since", "until", "time_delta", "limit", "filters"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
