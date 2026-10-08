/** @generated from zero-trust.casb.applications.auth-methods.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/one/applications/{application_id}/auth-methods",
	query: ["page", "page_size"],
	errors: {
		404: "NotFoundError",
	},
} as const;
