/** @generated from ai-search-namespace-instance-change-job-status */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}/jobs/${request.job_id}`,
	body: "json",
	constants: {
		action: "cancel",
	},
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
