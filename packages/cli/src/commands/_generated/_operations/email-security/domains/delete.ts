/** @generated from email-security.domains.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/domains/${request.domain_id}`,
} as const;
