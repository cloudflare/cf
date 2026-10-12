/** @generated from vectorize-list-vectorize-indexes */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/vectorize/v2/indexes`,
} as const;
