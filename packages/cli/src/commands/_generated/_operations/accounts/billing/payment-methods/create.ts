/** @generated from account-billing-create-payment-method */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/payment-methods`,
	body: "json",
} as const;
