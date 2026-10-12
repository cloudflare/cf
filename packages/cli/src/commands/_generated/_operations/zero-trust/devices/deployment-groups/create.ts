/** @generated from create-deployment-group */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/deployment-groups`,
	body: "json",
} as const;
