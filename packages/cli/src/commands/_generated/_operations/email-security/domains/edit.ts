/** @generated from email-security.domains.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/domains/${request.domain_id}`,
	body: "json",
} as const;
