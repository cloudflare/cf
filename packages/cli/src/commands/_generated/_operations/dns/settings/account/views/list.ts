/** @generated from dns.settings.account.views.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/views`,
	query: [
		"name",
		"name.exact",
		"name.contains",
		"name.startswith",
		"name.endswith",
		"zone_id",
		"zone_name",
		"match",
		"page",
		"per_page",
		"order",
		"direction",
	],
} as const;
