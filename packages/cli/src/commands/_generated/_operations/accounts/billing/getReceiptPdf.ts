/** @generated from account-billing-get-receipt-pdf */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/receipts/${request.receipt_id}/pdf`,
	query: ["doctype"],
	response: "binary-response",
} as const;
