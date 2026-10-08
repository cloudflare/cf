/** @generated from registrar-sandbox.registrations.search */
export default {
	method: "GET",
	path: "/accounts/{account_id}/registrar-sandbox/domain-search",
	query: ["q", "extensions", "limit"],
	joined: ["extensions"],
	errors: {
		400: "BadRequestError",
	},
} as const;
