/** @generated from kv.namespaces.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces/${request.namespace_id}`,
} as const;
