/** @generated from account-billing-delete-payment-method */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/payment-methods/${request.payment_method_id}`,
} as const;
