/** @generated from email-routing.addresses.update */
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
