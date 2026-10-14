/** @generated from email-routing.addresses.create */
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
