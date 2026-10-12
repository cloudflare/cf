/** @generated from agent-memory-namespace-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/agent-memory/namespaces`,
	query: ["per_page", "order", "direction", "cursor"],
} as const;
