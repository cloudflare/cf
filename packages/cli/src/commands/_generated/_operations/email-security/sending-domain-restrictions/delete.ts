/** @generated from email_security_delete_sending_domain_restriction */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/sending_domain_restrictions/${request.sending_domain_restriction_id}`,
} as const;
