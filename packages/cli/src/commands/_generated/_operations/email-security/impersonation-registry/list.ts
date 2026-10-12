/** @generated from email-security.impersonation-registry.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/impersonation_registry`,
	query: ["page", "per_page", "search", "order", "direction", "provenance"],
} as const;
