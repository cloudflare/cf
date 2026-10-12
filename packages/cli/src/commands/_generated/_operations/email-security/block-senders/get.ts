/** @generated from email_security_get_blocked_sender */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/block_senders/${request.pattern_id}`,
} as const;
