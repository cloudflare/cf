/** @generated from email_security_create_sending_domain_restriction */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/sending_domain_restrictions`,
	body: "json",
} as const;
