/** @generated from account-user-group-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/user_groups`,
	query: ["id", "name", "fuzzyName", "page", "per_page", "direction"],
} as const;
