/** @generated from ai-search-namespace-instance-get-item */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}/items/${request.item_id}`,
	errors: {
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
