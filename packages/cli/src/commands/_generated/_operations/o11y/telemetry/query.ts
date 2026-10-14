/** @generated from o11y.telemetry.query */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/telemetry/query`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
		504: "GatewayTimeoutError",
	},
} as const;
