/** @generated from email-routing-destination-addresses-update-destination-address */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/routing/addresses/${request.destination_address_identifier}`,
	body: "json",
	errors: {
		404: "NotFoundError",
	},
} as const;
