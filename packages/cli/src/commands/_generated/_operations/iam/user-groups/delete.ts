/** @generated from account-user-group-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/user_groups/${request.user_group_id}`,
} as const;
