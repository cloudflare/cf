/** @generated from email-security.trusted-domains.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/trusted_domains/${request.trusted_domain_id}`,
	body: "json",
} as const;
