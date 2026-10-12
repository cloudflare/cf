/** @generated from account-members-list-members */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/members`,
	query: ["order", "status", "page", "per_page", "direction"],
} as const;
