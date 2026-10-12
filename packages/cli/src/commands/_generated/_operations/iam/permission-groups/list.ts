/** @generated from iam.permission-groups.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/iam/permission_groups`,
	query: ["id", "name", "label", "page", "per_page"],
} as const;
