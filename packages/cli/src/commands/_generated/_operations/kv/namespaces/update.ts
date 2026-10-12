/** @generated from workers-kv-namespace-rename-a-namespace */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces/${request.namespace_id}`,
	body: "json",
} as const;
