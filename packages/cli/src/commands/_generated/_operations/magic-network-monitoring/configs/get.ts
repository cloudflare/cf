/** @generated from magic-network-monitoring.configs.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/config`,
} as const;
