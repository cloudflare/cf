/** @generated from ai-search.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances/${request.id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
