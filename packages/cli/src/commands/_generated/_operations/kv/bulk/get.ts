/** @generated from kv.bulk.get */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces/${request.namespace_id}/bulk/get`,
	body: "json",
} as const;
