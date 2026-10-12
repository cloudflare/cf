/** @generated from email_security_update_impersonation_registry */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/impersonation_registry/${request.impersonation_registry_id}`,
	body: "json",
} as const;
