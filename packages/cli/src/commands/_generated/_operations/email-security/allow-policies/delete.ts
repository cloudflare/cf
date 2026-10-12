/** @generated from email_security_delete_allow_policy */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/allow_policies/${request.policy_id}`,
} as const;
