/** @generated from email_security_list_url_ignore_patterns */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/url_ignore_patterns`,
	query: ["page", "per_page"],
} as const;
