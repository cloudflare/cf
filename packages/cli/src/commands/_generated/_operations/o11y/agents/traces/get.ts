/** @generated from o11y.agents.traces.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/agents/traces/${request.traceId}`,
	query: ["from", "to"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
		504: "GatewayTimeoutError",
	},
} as const;
