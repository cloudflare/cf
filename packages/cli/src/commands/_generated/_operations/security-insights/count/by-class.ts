/** @generated from security-insights.count.by-class */
export default {
	method: "GET",
	path: "/{account_or_zone}/{account_or_zone_id}/security-center/insights/class",
	query: [
		"dismissed",
		"issue_class",
		"issue_type",
		"product",
		"source",
		"severity",
		"subject",
		"issue_class~neq",
		"issue_type~neq",
		"product~neq",
		"severity~neq",
		"subject~neq",
	],
} as const;
