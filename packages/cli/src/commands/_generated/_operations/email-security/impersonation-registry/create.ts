/** @generated from email-security.impersonation-registry.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/impersonation_registry`,
	body: "json",
} as const;
