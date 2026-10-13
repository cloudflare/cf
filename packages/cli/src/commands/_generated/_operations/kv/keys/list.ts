/** @generated from kv.keys.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces/${request.namespace_id}/keys`,
	query: ["limit", "prefix", "cursor"],
} as const;
