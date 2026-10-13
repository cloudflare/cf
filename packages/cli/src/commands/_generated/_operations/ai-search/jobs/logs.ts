/** @generated from ai-search.jobs.logs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}/jobs/${request.job_id}/logs`,
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
