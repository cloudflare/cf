/** @generated from ai-search-namespace-instance-logs-item */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}/items/${request.item_id}/logs`,
	query: ["limit", "cursor"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
