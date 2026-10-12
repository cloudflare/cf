/** @generated from accounts.tokens.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tokens`,
	query: ["page", "per_page", "direction", "include_expired"],
} as const;
