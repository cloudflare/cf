/** @generated from ai-search.namespace.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
