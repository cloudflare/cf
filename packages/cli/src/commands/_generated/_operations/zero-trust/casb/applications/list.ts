/** @generated from zero-trust.casb.applications.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/one/applications",
	query: ["environment", "page", "page_size"],
	errors: {
		400: "BadRequestError",
	},
} as const;
