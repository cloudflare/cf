/** @generated from ai-search.jobs.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.namespace}/instances/${request.id}/jobs/${request.job_id}`,
	errors: {
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
