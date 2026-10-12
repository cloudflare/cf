/** @generated from account-billing-pay-invoice */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-invoice`,
	body: "json",
} as const;
