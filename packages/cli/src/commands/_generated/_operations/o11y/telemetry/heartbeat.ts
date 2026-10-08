/** @generated from o11y.telemetry.heartbeat */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/observability/telemetry/live-tail/heartbeat",
	body: "json",
	errors: {
		401: "UnauthorizedError",
		500: "InternalServerError",
	},
} as const;
