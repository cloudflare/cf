/** @generated from workers-kv-namespace-write-multiple-key-value-pairs */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces/${request.namespace_id}/bulk`,
	body: "json",
} as const;
