/** @generated from ai-search.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.namespace}/instances/${request.id}`,
	errors: {
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
