/** @generated from email-routing-destination-addresses-list-destination-addresses */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/routing/addresses`,
	query: ["page", "per_page", "direction", "verified"],
	errors: {
		403: "ForbiddenError",
	},
} as const;
