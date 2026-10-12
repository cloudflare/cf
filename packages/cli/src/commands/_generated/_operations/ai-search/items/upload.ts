/** @generated from ai-search.items.upload */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}/items`,
	pathParams: ["account_id", "name", "id"],
	body: "form",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
		413: "ContentTooLargeError",
		429: "TooManyRequestsError",
		499: "ClientClosedRequestError",
	},
} as const;
