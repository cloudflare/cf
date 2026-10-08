/** @generated from email-routing.addresses.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/email/routing/addresses/{destination_address_identifier}",
	body: "json",
	errors: {
		404: "NotFoundError",
	},
} as const;
