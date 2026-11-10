/** @generated from d1.insights.databases */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/insights/databases`,
	query: ["order_by", "database_name", "exact", "since", "until", "limit"],
} as const;
