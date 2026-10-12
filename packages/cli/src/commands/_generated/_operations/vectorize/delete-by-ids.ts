/** @generated from vectorize.delete-by-ids */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/vectorize/v2/indexes/${request.index_name}/delete_by_ids`,
	body: "json",
} as const;
