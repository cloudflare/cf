/** @generated from email_security_list_blocked_senders */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/block_senders`,
	query: [
		"page",
		"per_page",
		"search",
		"order",
		"direction",
		"pattern_type",
		"pattern",
	],
} as const;
