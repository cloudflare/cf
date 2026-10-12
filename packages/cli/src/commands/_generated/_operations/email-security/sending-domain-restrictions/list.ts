/** @generated from email_security_list_sending_domain_restrictions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/sending_domain_restrictions`,
	query: ["page", "per_page", "search", "order", "direction"],
} as const;
