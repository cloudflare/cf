/** @generated from workflows.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows`,
	query: ["per_page", "page", "search"],
	errors: {
		400: "BadRequestError",
	},
} as const;
