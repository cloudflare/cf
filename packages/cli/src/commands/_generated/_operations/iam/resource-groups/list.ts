/** @generated from iam.resource-groups.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/resource_groups`,
	query: ["id", "name"],
} as const;
