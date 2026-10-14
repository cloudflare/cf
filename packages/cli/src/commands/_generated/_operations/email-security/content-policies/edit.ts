/** @generated from email-security.content-policies.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/content_policies/${request.policy_id}`,
	body: "json",
} as const;
