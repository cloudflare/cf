/** @generated from diagnostics-endpoint-healthcheck-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/diagnostics/endpoint-healthchecks/${request.id}`,
} as const;
