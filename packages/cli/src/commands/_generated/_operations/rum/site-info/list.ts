/** @generated from web-analytics-list-sites */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/site_info/list`,
	query: ["per_page", "page", "order_by"],
} as const;
