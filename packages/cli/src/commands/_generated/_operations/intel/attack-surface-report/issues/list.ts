/** @generated from intel.attack-surface-report.issues.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/intel/attack-surface-report/issues",
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
		"page",
		"per_page",
	],
} as const;
