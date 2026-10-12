/** @generated from email_security_get_message_raw */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/${request.investigate_id}/raw`,
} as const;
