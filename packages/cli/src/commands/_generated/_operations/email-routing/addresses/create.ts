/** @generated from email-routing-destination-addresses-create-a-destination-address */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/routing/addresses`,
	body: "json",
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
