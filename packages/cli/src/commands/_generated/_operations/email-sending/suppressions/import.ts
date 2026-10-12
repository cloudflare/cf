/** @generated from post_publicBulkCreateSendingSuppressions */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/sending/suppressions/bulk`,
	body: "json",
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
