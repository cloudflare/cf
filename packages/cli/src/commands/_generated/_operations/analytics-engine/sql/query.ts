/** @generated from analytics-engine.sql.query */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/analytics_engine/sql`,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		422: "UnprocessableEntityError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
		504: "GatewayTimeoutError",
	},
} as const;
