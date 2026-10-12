/** @generated from email_security_update_content_policy */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/content_policies/${request.policy_id}`,
	body: "json",
} as const;
