/** @generated from diagnostics-endpoint-healthcheck-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/diagnostics/endpoint-healthchecks/${request.id}`,
} as const;
