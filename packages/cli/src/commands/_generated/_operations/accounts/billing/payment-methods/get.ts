/** @generated from accounts.billing.payment-methods.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/payment-methods/${request.payment_method_id}`,
} as const;
