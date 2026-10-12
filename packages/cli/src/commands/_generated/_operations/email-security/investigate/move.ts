/** @generated from email_security_post_bulk_move */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/move`,
	body: "json",
} as const;
