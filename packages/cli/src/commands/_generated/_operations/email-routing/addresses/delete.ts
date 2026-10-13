/** @generated from email-routing.addresses.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/routing/addresses/${request.destination_address_identifier}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
