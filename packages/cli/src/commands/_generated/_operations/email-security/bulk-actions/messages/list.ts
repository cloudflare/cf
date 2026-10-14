/** @generated from email-security.bulk-actions.messages.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/bulk/${request.job_id}/messages`,
	query: ["page", "per_page", "status"],
} as const;
