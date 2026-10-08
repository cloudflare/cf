/** @generated from zero-trust.casb.finding-types.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/data-security/posture/finding_types",
	query: ["page", "per_page", "vendors", "search"],
	joined: ["vendors"],
	errors: {
		400: "BadRequestError",
	},
} as const;
