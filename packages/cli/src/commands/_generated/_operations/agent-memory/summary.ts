/** @generated from agent-memory.summary */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/agent-memory/namespaces/${request.namespace_name}/profiles/${request.profile_name}/summary`,
	body: "json",
} as const;
