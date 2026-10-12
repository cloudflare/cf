/** @generated from diagnostics-endpoint-healthcheck-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/diagnostics/endpoint-healthchecks/${request.id}`,
	body: "json",
	constants: {
		check_type: "icmp",
	},
} as const;
