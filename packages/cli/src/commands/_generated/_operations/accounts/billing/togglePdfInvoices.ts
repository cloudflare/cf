/** @generated from account-billing-toggle-pdf-invoices */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/invoices`,
	body: "json",
} as const;
