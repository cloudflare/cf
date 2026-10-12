/** @generated from d1.time-travel.get-bookmark */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/database/${request.database_id}/time_travel/bookmark`,
	query: ["timestamp"],
} as const;
