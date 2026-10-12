/** @generated from email-security.submissions.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/submissions`,
	body: "json",
} as const;
