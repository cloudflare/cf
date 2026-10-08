/** @generated from cloudforce-one.threat-signals.feeds.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/v2/threat-signals/feeds",
	query: [
		"page",
		"per_page",
		"limit",
		"sort",
		"category",
		"source_type",
		"enabled",
		"status",
	],
	errors: {
		503: "ServiceUnavailableError",
	},
} as const;
