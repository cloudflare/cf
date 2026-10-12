/** @generated from flagship_evaluate_flag */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/flagship/apps/${request.app_id}/evaluate`,
	query: ["flagKey", "targetingKey"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
