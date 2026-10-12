/** @generated from shared.query.post */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/shared/query`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
