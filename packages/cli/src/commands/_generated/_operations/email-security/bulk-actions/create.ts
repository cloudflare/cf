/** @generated from email-security.bulk-actions.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/bulk`,
	body: "json",
} as const;
