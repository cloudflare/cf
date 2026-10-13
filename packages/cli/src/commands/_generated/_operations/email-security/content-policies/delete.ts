/** @generated from email-security.content-policies.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/content_policies/${request.policy_id}`,
} as const;
