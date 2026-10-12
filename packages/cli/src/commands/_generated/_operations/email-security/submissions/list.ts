/** @generated from email_security_submissions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/submissions`,
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
