/** @generated from durable-objects-namespace-list-objects */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/durable_objects/namespaces/${request.id}/objects`,
	query: ["limit", "cursor"],
} as const;
