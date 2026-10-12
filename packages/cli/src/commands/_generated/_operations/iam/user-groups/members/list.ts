/** @generated from account-user-group-member-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/user_groups/${request.user_group_id}/members`,
	query: ["page", "per_page", "fuzzyEmail", "direction"],
} as const;
