/** @generated from web-analytics-list-site-tags */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/site_info/site_tag/list`,
	query: ["all"],
} as const;
