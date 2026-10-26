/** @generated from ai-search.stats */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.namespace}/instances/${request.id}/stats`,
	errors: {
		404: "NotFoundError",
	},
} as const;
