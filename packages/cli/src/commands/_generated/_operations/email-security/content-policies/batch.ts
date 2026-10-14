/** @generated from email-security.content-policies.batch */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/content_policies/batch`,
	body: "json",
} as const;
