/** @generated from email-security.trusted-domains.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/trusted_domains/${request.trusted_domain_id}`,
	body: "json",
} as const;
