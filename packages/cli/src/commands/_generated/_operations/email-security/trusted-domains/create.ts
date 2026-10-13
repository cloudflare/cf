/** @generated from email-security.trusted-domains.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/trusted_domains`,
	body: "json",
} as const;
