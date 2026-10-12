/** @generated from email_security_create_blocked_sender */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/block_senders`,
	body: "json",
} as const;
