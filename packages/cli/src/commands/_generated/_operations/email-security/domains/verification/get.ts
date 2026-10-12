/** @generated from email_security_get_domain_verification */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/domains/${request.domain_id}/verification`,
} as const;
