/** @generated from email-security.url-ignore-patterns.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/url_ignore_patterns/${request.pattern_id}`,
} as const;
