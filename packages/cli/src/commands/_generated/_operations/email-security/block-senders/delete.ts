/** @generated from email_security_delete_blocked_sender */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/block_senders/${request.pattern_id}`,
} as const;
