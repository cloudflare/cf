/** @generated from flagship_update_flag */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/flagship/apps/${request.app_id}/flags/${request.flag_key}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
