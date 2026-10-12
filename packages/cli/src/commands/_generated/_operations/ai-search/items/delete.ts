/** @generated from ai-search-namespace-instance-delete-item */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}/items/${request.item_id}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
