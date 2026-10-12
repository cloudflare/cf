/** @generated from access-jit-request-logs-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/logs/jit_requests`,
	query: ["page", "per_page", "status", "search", "since", "until"],
} as const;
