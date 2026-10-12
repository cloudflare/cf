/** @generated from diagnostics-endpoint-healthcheck-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/diagnostics/endpoint-healthchecks`,
} as const;
