/** @generated from account-resource-group-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/resource_groups/${request.resource_group_id}`,
} as const;
