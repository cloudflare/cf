/** @generated from ai-search.items.chunks */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}/items/${request.item_id}/chunks`,
	query: ["limit", "offset"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		503: "ServiceUnavailableError",
	},
} as const;
