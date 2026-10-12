/** @generated from d1-time-travel-restore */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/database/${request.database_id}/time_travel/restore`,
	query: ["bookmark", "timestamp"],
} as const;
