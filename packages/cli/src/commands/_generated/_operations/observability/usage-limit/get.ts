/** @generated from observability.usage-limit.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/observability/usage/limit`,
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
