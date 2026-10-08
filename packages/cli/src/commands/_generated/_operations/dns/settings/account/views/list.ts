/** @generated from dns.settings.account.views.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/dns_settings/views",
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
