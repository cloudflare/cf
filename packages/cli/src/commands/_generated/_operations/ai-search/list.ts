/** @generated from ai-search.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai-search/namespaces/${request.namespace}/instances`,
	query: [
		"page",
		"per_page",
		"search",
		"hostname",
		"order_by",
		"order_by_direction",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
