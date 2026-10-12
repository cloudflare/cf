/** @generated from web-analytics-list-zone-tags */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/site_info/zone_tag/list`,
} as const;
