/** @generated from images.import.logs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/sourcingkit/migrations/${request.migration_id}/logs`,
	query: ["offset", "limit"],
} as const;
