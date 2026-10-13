/** @generated from agent-memory.get-memory */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/agent-memory/namespaces/${request.namespace_name}/profiles/${request.profile_name}/memories/${request.memory_id}`,
} as const;
