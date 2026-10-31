/** @generated from accounts.entitlements.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/entitlements`,
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		405: "MethodNotAllowedError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
