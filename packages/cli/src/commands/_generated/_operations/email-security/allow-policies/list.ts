/** @generated from email-security.allow-policies.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/email-security/settings/allow_policies",
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
	],
} as const;
