/** @generated from d1.insights.queries */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/insights/queries`,
	query: ["order_by", "database_id", "since", "until", "limit"],
} as const;
