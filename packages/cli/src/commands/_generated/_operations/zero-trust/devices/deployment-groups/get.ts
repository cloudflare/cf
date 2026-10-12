/** @generated from get-deployment-group */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/deployment-groups/${request.group_id}`,
} as const;
