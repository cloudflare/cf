/** @generated from iam.resource-groups.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/resource_groups`,
	body: "json",
} as const;
