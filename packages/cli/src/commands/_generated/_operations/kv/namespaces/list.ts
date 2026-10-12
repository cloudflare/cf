/** @generated from kv.namespaces.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/storage/kv/namespaces`,
	query: ["page", "per_page", "order", "direction"],
} as const;
