/** @generated from metricsExport.upsert */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/metricsexport`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		500: "InternalServerError",
	},
} as const;
