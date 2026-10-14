/** @generated from zero-trust.devices.deployment-groups.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/deployment-groups`,
	query: ["page", "per_page"],
} as const;
