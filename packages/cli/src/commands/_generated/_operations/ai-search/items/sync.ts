/** @generated from ai-search.items.sync */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.namespace}/instances/${request.id}/items/${request.item_id}`,
	body: "json",
	constants: {
		next_action: "INDEX",
	},
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		503: "ServiceUnavailableError",
	},
} as const;
