/** @generated from email-security.allow-policies.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/allow_policies`,
	query: [
		"page",
		"per_page",
		"search",
		"order",
		"direction",
		"is_exempt_recipient",
		"is_trusted_sender",
		"is_acceptable_sender",
		"verify_sender",
		"pattern_type",
		"pattern",
		"expired",
	],
} as const;
