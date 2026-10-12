/** @generated from magic-network-monitoring-configuration-update-an-entire-account-configuration */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/config`,
	body: "json",
} as const;
