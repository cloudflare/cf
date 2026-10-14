/** @generated from email-security.sending-domain-restrictions.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/sending_domain_restrictions`,
	body: "json",
} as const;
