/** @generated from email_security_update_blocked_sender */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/block_senders/${request.pattern_id}`,
	body: "json",
} as const;
