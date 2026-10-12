/** @generated from metricsExport.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/observability/metricsexport`,
	errors: {
		401: "UnauthorizedError",
		500: "InternalServerError",
	},
} as const;
