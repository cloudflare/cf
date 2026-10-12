/** @generated from ai-search-namespace-fetch-instance */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
