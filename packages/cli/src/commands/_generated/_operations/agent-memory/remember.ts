/** @generated from agent-memory.remember */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/agent-memory/namespaces/${request.namespace_name}/profiles/${request.profile_name}/remember`,
	body: "json",
} as const;
