/** @generated from accounts.roles.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/roles`,
	query: ["page", "per_page"],
} as const;
