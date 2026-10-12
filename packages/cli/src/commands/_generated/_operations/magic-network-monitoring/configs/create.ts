/** @generated from magic-network-monitoring-configuration-create-account-configuration */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/config`,
	body: "json",
} as const;
