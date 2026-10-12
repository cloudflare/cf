/** @generated from email_security_get_url_ignore_pattern */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/url_ignore_patterns/${request.pattern_id}`,
} as const;
