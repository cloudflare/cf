/** @generated from agent-memory.list-profiles */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/agent-memory/namespaces/${request.namespace_name}/profiles`,
	query: ["per_page", "cursor"],
} as const;
