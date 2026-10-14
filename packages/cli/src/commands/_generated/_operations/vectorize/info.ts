/** @generated from vectorize.info */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/vectorize/v2/indexes/${request.index_name}/info`,
} as const;
