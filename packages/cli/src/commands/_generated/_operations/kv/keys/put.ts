/** @generated from kv.keys.put */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces/${request.namespace_id}/values/${request.key_name}`,
	pathParams: ["account_id", "namespace_id", "key_name"],
	query: ["expiration", "expiration_ttl"],
	body: "form",
} as const;
