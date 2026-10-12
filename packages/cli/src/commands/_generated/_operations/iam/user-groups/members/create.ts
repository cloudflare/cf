/** @generated from iam.user-groups.members.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/user_groups/${request.user_group_id}/members`,
	body: "json",
} as const;
