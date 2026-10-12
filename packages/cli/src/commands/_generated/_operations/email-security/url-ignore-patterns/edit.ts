/** @generated from email_security_update_url_ignore_pattern */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/url_ignore_patterns/${request.pattern_id}`,
	body: "json",
} as const;
