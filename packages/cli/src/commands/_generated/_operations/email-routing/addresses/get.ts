/** @generated from email-routing.addresses.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/routing/addresses/${request.destination_address_identifier}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
