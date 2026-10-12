/** @generated from agent-memory-memory-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/agent-memory/namespaces/${request.namespace_name}/profiles/${request.profile_name}/memories`,
	query: ["per_page", "cursor", "session_id", "type"],
} as const;
