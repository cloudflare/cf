/** @generated from email-sending.suppressions.import */
export default {
	method: "POST",
	path: "/accounts/{account_id}/email/sending/suppressions/bulk",
	body: "json",
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
