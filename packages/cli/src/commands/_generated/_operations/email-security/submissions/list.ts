/** @generated from email-security.submissions.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/email-security/submissions",
	query: [
		"start",
		"end",
		"type",
		"submission_id",
		"original_disposition",
		"requested_disposition",
		"outcome_disposition",
		"status",
		"query",
		"escalated_from_user",
		"order",
		"direction",
		"page",
		"per_page",
	],
} as const;
