/** @generated from delete-deployment-group */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/deployment-groups/${request.group_id}`,
} as const;
