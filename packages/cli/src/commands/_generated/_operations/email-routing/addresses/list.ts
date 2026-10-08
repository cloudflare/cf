/** @generated from email-routing.addresses.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/email/routing/addresses",
	query: ["page", "per_page", "direction", "verified"],
	errors: {
		403: "ForbiddenError",
	},
} as const;
