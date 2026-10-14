/** @generated from email-security.url-ignore-patterns.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/url_ignore_patterns/${request.pattern_id}`,
	body: "json",
} as const;
