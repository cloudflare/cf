/** @generated from ai-search-namespace-create-instance */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}/instances`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		409: "ConflictError",
	},
} as const;
