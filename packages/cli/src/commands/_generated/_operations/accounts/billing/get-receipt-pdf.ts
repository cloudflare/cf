/** @generated from accounts.billing.get-receipt-pdf */
export default {
	method: "GET",
	path: "/accounts/{account_id}/receipts/{receipt_id}/pdf",
	query: ["doctype"],
	response: "binary-response",
} as const;
