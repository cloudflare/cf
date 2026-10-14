/** @generated from workers.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/workers`,
	query: ["page", "per_page", "order_by", "order"],
	errors: {
		401: "UnauthorizedError",
		500: "InternalServerError",
	},
} as const;
