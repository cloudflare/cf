/** @generated from email-security.impersonation-registry.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/impersonation_registry/${request.impersonation_registry_id}`,
} as const;
