/** @generated from o11y.telemetry.live-tail */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/observability/telemetry/live-tail",
	body: "json",
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
