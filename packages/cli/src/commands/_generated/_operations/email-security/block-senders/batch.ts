/** @generated from email_security_batch_blocked_senders */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/block_senders/batch`,
	body: "json",
} as const;
