/** @generated from ai-search.jobs.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.namespace}/instances/${request.id}/jobs`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		503: "ServiceUnavailableError",
	},
} as const;
