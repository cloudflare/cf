/** @generated from email_security_update_sending_domain_restriction */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/sending_domain_restrictions/${request.sending_domain_restriction_id}`,
	body: "json",
} as const;
