/** @generated from zero-trust.devices.deployment-groups.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/deployment-groups/${request.group_id}`,
} as const;
