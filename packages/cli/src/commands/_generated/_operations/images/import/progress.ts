/** @generated from images.import.progress */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/sourcingkit/migrations/${request.migration_id}/lifecycle`,
} as const;
