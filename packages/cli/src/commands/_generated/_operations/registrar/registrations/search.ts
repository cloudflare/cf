/** @generated from registrar.registrations.search */
export default {
	method: "GET",
	path: "/accounts/{account_id}/registrar/domain-search",
	query: ["q", "extensions", "limit"],
	joined: ["extensions"],
	errors: {
		400: "BadRequestError",
	},
} as const;
