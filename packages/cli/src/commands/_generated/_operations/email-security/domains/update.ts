/** @generated from email_security_replace_domain */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/domains/${request.domain_id}`,
	body: "json",
} as const;
