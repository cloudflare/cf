/** @generated from kv.keys.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces/${request.namespace_id}/values/${request.key_name}`,
	response: "binary-response",
} as const;
