/** @generated from intel.attack-surface-report.issues.type */
export default {
	method: "GET",
	path: "/accounts/{account_id}/intel/attack-surface-report/issues/type",
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
