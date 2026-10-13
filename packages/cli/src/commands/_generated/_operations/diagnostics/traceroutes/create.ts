/** @generated from diagnostics.traceroutes.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/diagnostics/traceroute`,
	body: "json",
} as const;
