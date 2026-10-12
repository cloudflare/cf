/** @generated from vectorize-list-vectors */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/vectorize/v2/indexes/${request.index_name}/list`,
	query: ["count", "cursor"],
} as const;
