/** @generated from iam.permission-groups.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/permission_groups/${request.permission_group_id}`,
} as const;
