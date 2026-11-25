/** @generated from d1.insights.recommendations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/insights/recommendations`,
	query: ["database_id", "limit", "cursor"],
	joined: ["database_id"],
} as const;
