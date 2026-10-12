/** @generated from agent-memory-namespace-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/agent-memory/namespaces`,
	body: "json",
} as const;
