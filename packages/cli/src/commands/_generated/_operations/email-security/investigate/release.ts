/** @generated from email_security_post_release */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/release`,
	body: "json",
} as const;
