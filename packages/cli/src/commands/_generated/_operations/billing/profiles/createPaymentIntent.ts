/** @generated from account-billing-create-payment-intent */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billing/profile/payment-method`,
} as const;
