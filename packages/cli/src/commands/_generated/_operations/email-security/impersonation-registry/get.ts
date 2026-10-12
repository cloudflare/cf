/** @generated from email_security_get_impersonation_registry */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/impersonation_registry/${request.impersonation_registry_id}`,
} as const;
