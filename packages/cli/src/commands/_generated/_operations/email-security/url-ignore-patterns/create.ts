/** @generated from email-security.url-ignore-patterns.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/url_ignore_patterns`,
	body: "json",
} as const;
