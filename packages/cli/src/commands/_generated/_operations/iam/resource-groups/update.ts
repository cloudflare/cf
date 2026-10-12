/** @generated from account-resource-group-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/resource_groups/${request.resource_group_id}`,
	body: "json",
} as const;
