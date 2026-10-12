/** @generated from diagnostics-endpoint-healthcheck-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/diagnostics/endpoint-healthchecks`,
	body: "json",
	constants: {
		check_type: "icmp",
	},
} as const;
