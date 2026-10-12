/** @generated from account-user-group-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/user_groups/${request.user_group_id}`,
} as const;
