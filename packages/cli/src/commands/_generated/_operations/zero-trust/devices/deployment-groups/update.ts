/** @generated from update-deployment-group */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/deployment-groups/${request.group_id}`,
	body: "json",
} as const;
