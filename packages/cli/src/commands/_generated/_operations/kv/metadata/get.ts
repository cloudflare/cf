/** @generated from workers-kv-namespace-read-the-metadata-for-a-key */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces/${request.namespace_id}/metadata/${request.key_name}`,
} as const;
