/** @generated from email_security_create_url_ignore_pattern */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/url_ignore_patterns`,
	body: "json",
} as const;
