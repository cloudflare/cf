/** @generated from workers-kv-namespace-get-a-namespace */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces/${request.namespace_id}`,
} as const;
