/** @generated from magic-network-monitoring.configs.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/config`,
	body: "json",
} as const;
