/** @generated from account-billing-update-payment-method */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/payment-methods/${request.payment_method_id}`,
	body: "json",
} as const;
