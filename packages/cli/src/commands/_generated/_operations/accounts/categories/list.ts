/** @generated from accounts.categories.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/resource-library/categories`,
	query: ["limit", "offset"],
} as const;
