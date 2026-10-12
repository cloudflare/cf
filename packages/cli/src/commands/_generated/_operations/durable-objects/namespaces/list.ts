/** @generated from durable-objects-namespace-list-namespaces */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/durable_objects/namespaces`,
	query: ["page", "per_page"],
} as const;
