/** @generated from account-billing-list-payment-methods */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/payment-methods`,
	query: ["page", "per_page"],
} as const;
