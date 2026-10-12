/** @generated from account-billing-get-unpaid-invoices */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billing/unpaid-invoice`,
} as const;
