/** @generated from email-security.allow-policies.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/allow_policies/${request.policy_id}`,
	body: "json",
} as const;
