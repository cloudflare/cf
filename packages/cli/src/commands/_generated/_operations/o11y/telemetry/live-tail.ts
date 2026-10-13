/** @generated from o11y.telemetry.live-tail */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/telemetry/live-tail`,
	body: "json",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
