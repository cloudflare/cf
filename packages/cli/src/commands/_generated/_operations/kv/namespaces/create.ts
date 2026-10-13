/** @generated from kv.namespaces.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces`,
	body: "json",
} as const;
