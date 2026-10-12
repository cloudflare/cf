/** @generated from email_security_batch_url_ignore_patterns */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/url_ignore_patterns/batch`,
	body: "json",
} as const;
