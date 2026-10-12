/** @generated from zero-trust.access.users.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/users`,
	query: ["name", "email", "search", "page", "per_page"],
} as const;
