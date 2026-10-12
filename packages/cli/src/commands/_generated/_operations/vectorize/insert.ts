/** @generated from vectorize-insert-vector */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/vectorize/v2/indexes/${request.index_name}/insert`,
	query: ["unparsable-behavior"],
	body: "json",
	contentType: "application/x-ndjson",
} as const;
