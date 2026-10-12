/** @generated from vectorize-delete-metadata-index */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/vectorize/v2/indexes/${request.index_name}/metadata_index/delete`,
	body: "json",
} as const;
