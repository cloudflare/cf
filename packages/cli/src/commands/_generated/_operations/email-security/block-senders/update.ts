/** @generated from email_security_replace_blocked_sender */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/block_senders/${request.pattern_id}`,
	body: "json",
} as const;
