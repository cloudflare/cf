/** @generated from magic-network-monitoring.configs.full.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/config/full`,
} as const;
