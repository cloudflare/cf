/** @generated from ai-search.purge-cache */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.namespace}/instances/${request.id}/purge_cache`,
	errors: {
		404: "NotFoundError",
	},
} as const;
