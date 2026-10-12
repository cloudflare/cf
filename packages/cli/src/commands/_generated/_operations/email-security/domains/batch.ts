/** @generated from email_security_batch_domains */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/domains/batch`,
	body: "json",
} as const;
