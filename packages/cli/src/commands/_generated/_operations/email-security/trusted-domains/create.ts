/** @generated from email_security_create_trusted_domain */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/trusted_domains`,
	body: "json",
} as const;
