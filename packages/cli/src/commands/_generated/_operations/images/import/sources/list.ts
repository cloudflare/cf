/** @generated from images.import.sources.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/sourcingkit/sources`,
	query: ["offset", "limit", "name"],
} as const;
