/** @generated from zero-trust.access.user-populations.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/user_populations`,
	query: ["page", "per_page"],
} as const;
