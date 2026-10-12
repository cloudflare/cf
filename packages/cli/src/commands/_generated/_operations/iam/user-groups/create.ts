/** @generated from account-user-group-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/user_groups`,
	body: "json",
} as const;
