/** @generated from email_security_list_trusted_domains */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/trusted_domains`,
	query: [
		"page",
		"per_page",
		"search",
		"order",
		"direction",
		"is_recent",
		"is_similarity",
		"pattern",
	],
} as const;
