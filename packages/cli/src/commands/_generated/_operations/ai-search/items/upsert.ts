/** @generated from ai-search.items.upsert */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.namespace}/instances/${request.id}/items`,
	body: "json",
	constants: {
		next_action: "INDEX",
	},
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
		429: "TooManyRequestsError",
		503: "ServiceUnavailableError",
	},
} as const;
