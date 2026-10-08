/** @generated from o11y.metrics-export.upsert */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workers/observability/metricsexport",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		500: "InternalServerError",
	},
} as const;
