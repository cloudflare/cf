/** @generated from email_security_list_content_policies */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/content_policies`,
	query: [
		"page",
		"per_page",
		"search",
		"order",
		"direction",
		"enabled",
		"name",
	],
} as const;
