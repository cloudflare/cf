/** @generated from email_security_get_trusted_domain */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/trusted_domains/${request.trusted_domain_id}`,
} as const;
