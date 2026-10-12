/** @generated from access-user-populations-list-user-populations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/user_populations`,
	query: ["page", "per_page"],
} as const;
