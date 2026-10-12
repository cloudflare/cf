/** @generated from email-security.url-ignore-patterns.batch */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/url_ignore_patterns/batch`,
	body: "json",
} as const;
