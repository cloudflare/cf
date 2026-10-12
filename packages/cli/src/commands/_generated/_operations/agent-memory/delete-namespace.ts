/** @generated from agent-memory-namespace-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/agent-memory/namespaces/${request.namespace_name}`,
} as const;
