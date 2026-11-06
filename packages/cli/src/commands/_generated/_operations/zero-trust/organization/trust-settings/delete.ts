/** @generated from zero-trust.organization.trust-settings.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/organizations/trust_settings`,
} as const;
