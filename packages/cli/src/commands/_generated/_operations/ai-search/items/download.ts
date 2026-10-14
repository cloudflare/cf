/** @generated from ai-search.items.download */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}/items/${request.item_id}/download`,
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		503: "ServiceUnavailableError",
	},
} as const;
