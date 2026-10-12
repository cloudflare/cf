/** @generated from magic-network-monitoring-configuration-list-rules-and-account-configuration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/config/full`,
} as const;
