/** @generated from email-security.url-ignore-patterns.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/url_ignore_patterns`,
	query: ["page", "per_page"],
} as const;
