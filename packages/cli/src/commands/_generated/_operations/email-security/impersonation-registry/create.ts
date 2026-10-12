/** @generated from email_security_create_impersonation_registry */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/impersonation_registry`,
	body: "json",
} as const;
