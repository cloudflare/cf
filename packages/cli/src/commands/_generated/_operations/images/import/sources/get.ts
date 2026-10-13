/** @generated from images.import.sources.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/sourcingkit/sources/${request.source_id}`,
} as const;
