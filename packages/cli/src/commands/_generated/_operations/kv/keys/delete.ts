/** @generated from workers-kv-namespace-delete-key-value-pair */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces/${request.namespace_id}/values/${request.key_name}`,
} as const;
