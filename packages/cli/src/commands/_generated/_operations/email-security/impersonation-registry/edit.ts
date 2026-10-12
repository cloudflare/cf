/** @generated from email-security.impersonation-registry.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/impersonation_registry/${request.impersonation_registry_id}`,
	body: "json",
} as const;
