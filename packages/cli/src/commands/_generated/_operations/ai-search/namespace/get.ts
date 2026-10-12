/** @generated from ai-search-fetch-namespace */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.name}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
