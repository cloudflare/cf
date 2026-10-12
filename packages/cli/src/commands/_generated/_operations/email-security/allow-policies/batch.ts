/** @generated from email-security.allow-policies.batch */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/allow_policies/batch`,
	body: "json",
} as const;
