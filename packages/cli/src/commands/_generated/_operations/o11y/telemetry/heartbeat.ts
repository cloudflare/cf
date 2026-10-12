/** @generated from telemetry.live-tail.heartbeat.get */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/telemetry/live-tail/heartbeat`,
	body: "json",
	errors: {
		401: "UnauthorizedError",
		500: "InternalServerError",
	},
} as const;
